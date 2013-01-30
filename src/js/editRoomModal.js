// editRoomModal.js
//
// A dialog box for editing or viewing the properties of the current
// room. This may also be used as a dialog for creating a new room.

/*global define:true */
define(['jquery', 'js/util', 'js/appnet', 'js/roomInfo',
        'js/UserFields',
        'text!template/editRoomModal.html', 'bootstrap'],
function ($, util, appnet, roomInfo, UserFields, editTemplate) {
  'use strict';

  var editRoomModal = {
  };

  var editRoomFields = null;
  var editRoomChannel = null;
  var editRoomType = null;

  editRoomModal.init = function ()
  {
    $('#modal-container').append(editTemplate);
    editRoomFields = new UserFields('edit-room');
    $('#edit-room-save').click(clickSave);
    $('#edit-room-perm').on('change', function (event) {
      updatePatterPerm();
    });
    $('#edit-room-promote').on('change', function (event) {
      updatePatterPerm();
    });
    $('#edit-room-form').on('submit', function (event) {
      event.preventDefault();
      $('#edit-room-save').click();
      return false;
    });
  };

  editRoomModal.show = function ()
  {
    $('#edit-room-modal').modal();
  };

  editRoomModal.canEditChannel = function (channel) {
    return channel.you_can_edit &&
      (channel.type === 'net.patter-app.room' ||
       ! channel.writers.immutable ||
       ! channel.readers.immutable);
  };

  editRoomModal.update = function (newChannel, newType)
  {
    editRoomChannel = newChannel;
    editRoomType = newType;
    var canEdit = true;
    if (editRoomChannel !== null) {
      canEdit = this.canEditChannel(editRoomChannel);
      editRoomType = editRoomChannel.type;
    }
    var settings = appnet.note.findPatterSettings(editRoomChannel);

    // Modal Title
    var roomType = 'Create ';
    if (editRoomChannel !== null && canEdit) {
      roomType = 'Edit ';
    } else if (editRoomChannel !== null) {
      roomType = 'View ';
    }
    if (editRoomType === 'net.patter-app.room') {
      roomType += 'Patter Room';
    } else if (editRoomType === 'net.app.core.pm') {
      roomType += 'PM Channel';
    }
    $('#edit-room-type').html(roomType);
    
    // Modal subtitle
    var ownerText = '';
    if (editRoomChannel !== null) {
      ownerText = 'Owned by @' + editRoomChannel.owner.username;
    }
    $('#edit-room-owner').html(ownerText);
    
    $('#edit-room-body').hide();
    if (editRoomChannel === null) {
      if (editRoomType === 'net.patter-app.room') {
        $('#edit-room-body').html('Patter rooms may be public or private and the owner can modify permissions after they are created.');
        $('#edit-room-body').show();
      } else if (editRoomType === 'net.app.core.pm') {
        $('#edit-room-body').html('Private message channels are always private, and you cannot change their permissions.');
        $('#edit-room-body').show();
      }
    }

    // Set name field
    if (editRoomType === 'net.patter-app.room') {
      $('#edit-room-name').show();
    } else {
      $('#edit-room-name').hide();
    }
    
    $('#edit-room-text').val('');
    if (editRoomChannel === null && editRoomType === 'net.app.core.pm') {
      $('#edit-room-text').show();
    } else {
      $('#edit-room-text').hide();
    }

    $('#edit-room-perm').removeAttr('disabled');
    if (editRoomType === 'net.app.core.pm') {
      $('#edit-room-perm').attr('disabled', true);
      $('#edit-room-perm').val('private');
    } else if (editRoomChannel !== null &&
               (editRoomChannel.writers['public'] ||
                editRoomChannel.writers.any_user)) {
      $('#edit-room-perm').val('public');
    } else if (editRoomChannel !== null &&
               (editRoomChannel.readers['public'] ||
                editRoomChannel.readers.any_user)) {
      $('#edit-room-perm').val('public-read');
    } else {
      $('#edit-room-perm').val('private');
    }

    if (settings.name)
    {
      $('#edit-room-name').val(settings.name);
    }
    else
    {
      $('#edit-room-name').val('');
    }

    if (settings.blurb && settings.blurb_id)
    {
      $('#edit-room-promo-text').val(settings.blurb);
      $('#edit-room-promote').attr('checked', 'checked');
    }
    else
    {
      $('#edit-room-promo-text').val('');
      $('#edit-room-promote').removeAttr('checked');
    }

    editRoomFields.reset();
    if (editRoomChannel !== null)
    {
      var keys = Object.keys(roomInfo.members);
      var i = 0;
      for (i = 0; i < keys.length; i += 1) {
        editRoomFields.addField('@' + keys[i]);
      }
    }
    if (canEdit) {
      editRoomFields.addField();
    }
    if (canEdit) {
      $('#edit-room-save').show();
      $('#edit-room-cancel').html('Cancel');
      if (editRoomChannel !== null && editRoomChannel.writers.immutable) {
        $('#edit-room-perm').attr('disabled', true);
        editRoomFields.disable();
      } else {
        editRoomFields.enable();
      }
      if (editRoomChannel !== null && editRoomChannel.readers.immutable) {
        $('#edit-room-perm').attr('disabled', true);
      }
    } else {
      $('#edit-room-save').hide();
      $('#edit-room-cancel').html('Back');
      $('#edit-room-name').attr('disabled', true);
      $('#edit-room-perm').attr('disabled', true);
      editRoomFields.disable();
    }
    if (editRoomChannel === null)
    {
      $('#edit-room-save').html('Create');
    }
    else
    {
      $('#edit-room-save').html('Save');
    }
    $('#edit-room-error-div').html('');
    updatePatterPerm();
  };

  function completeEditRoom(names) {
    var settings = appnet.note.findPatterSettings(editRoomChannel);
    if (names && names.length === 0 &&
        editRoomType === 'net.app.core.pm') {
      util.flagError('pm-create-fields-error-div', 'You need at least one recipient');
    } else if (names) {
      if (editRoomType === 'net.app.core.pm') {
        createPmChannel(names);
      } else {
        if (editRoomChannel === null) {
          createPatterChannel(names);
        } else {
          if (getPromo() === '' || settings.blurb_id) {
            changePatterChannel(editRoomChannel, names);
          } else {
            createBlurb(editRoomChannel, names);
          }
        }
      }
      $('#edit-room-modal').modal('hide');
    }
    enableEditRoom();
  }

  function disableEditRoom() {
    $('#edit-room-x').attr('disabled', true);
    $('#edit-room-name').attr('disabled', true);
    $('#edit-room-text').attr('disabled', true);
    $('#edit-room-perm').attr('disabled', true);
    $('#edit-room-cancel').attr('disabled', true);
    $('#edit-room-save').button('loading');
    editRoomFields.disable();
  }

  function enableEditRoom() {
    $('#edit-room-x').removeAttr('disabled');
    $('#edit-room-name').removeAttr('disabled');
    $('#edit-room-text').removeAttr('disabled');
    $('#edit-room-perm').removeAttr('disabled');
    $('#edit-room-cancel').removeAttr('disabled');
    $('#edit-room-save').button('reset');
    editRoomFields.enable();
  }

  function getPatterAccess(perm, members, oldChannel)
  {
    var channel = { auto_subscribe: true };
    if (! oldChannel || ! oldChannel.writers.immutable) {
      var canWrite = (perm === 'public');
      var writers = {
        immutable: false,
        any_user: canWrite
      };
      if (! canWrite)
      {
        writers.user_ids = members;
      }
      channel.writers = writers;
    }
    if (! oldChannel || ! oldChannel.readers.immutable) {
      var canRead = (perm === 'public' || perm === 'public-read');
      var readers = {
        immutable: false,
        'public': canRead
      };
      channel.readers = readers;
    }

    return channel;
  }

  function getPatterNotes(channel, name, promo, blurbId)
  {
    var annotations = [];
    var settings = appnet.note.findPatterSettings(channel);
    var settingsNote = {
      type: 'net.patter-app.settings',
      value: { name: name }
    };
    if (promo === '' && settings.blurb_id) {
      appnet.api.deleteMessage('1614', settings.blurb_id,
                               null, null, null);
    } else if (promo !== '' && ! blurbId && settings.blurb_id) {
      blurbId = settings.blurb_id;
    }
    if (blurbId) {
      settingsNote.value.blurb_id = blurbId;
      settingsNote.value.blurb = promo;
    }
    annotations.push(settingsNote);
    var fallback = {
      type: 'net.app.core.fallback_url',
      value: {
        url: 'http://patter-app.net/room.html?channel=' + channel.id
      }
    };
    annotations.push(fallback);
    return annotations;
  }

  function updatePatterPerm() {
    var perm = $('#edit-room-perm');
    var label = $('#edit-room-perm-label');
    var pwrapper = $('#edit-room-promote-wrapper');
    var pbox = $('#edit-room-promote');
    var ptext = $('#edit-room-promo-text');
    var fields = editRoomFields;

    if (perm.val() === 'private' ||
        (editRoomChannel !== null &&
         ! editRoomModal.canEditChannel(editRoomChannel))) {
      pwrapper.hide();
    } else {
      pwrapper.show();
    }

    if (pbox.attr('checked')) {
      ptext.show();
    } else {
      ptext.hide();
    }

    if (perm.val() === 'public') {
      fields.hide();
    } else {
      fields.show();
    }
    if (perm.val() === 'private') {
      label.html('This room is private and only accessible by its members.');
    } else if (perm.val() === 'public') {
      label.html('This room is public and anyone may join or view it.');
    } else if (perm.val() === 'public-read') {
      label.html('Only members may participate, but anyone may view this room.');
    }
  }

  function getPromo()
  {
    var promo = '';
    if ($('#edit-room-promote').attr('checked'))
    {
      promo = $('#edit-room-promo-text').val();
    }
    return promo;
  }

  function changePatterChannel(oldChannel, names, blurbId, callback) {
    if (names)
    {
      var success = $.proxy(roomInfo.completeChannelInfo, roomInfo);
      if (callback)
      {
        success = callback;
      }
      var channel = getPatterAccess($('#edit-room-perm').val(),
                                    names, oldChannel);
      channel.annotations = getPatterNotes(oldChannel,
                                           $('#edit-room-name').val(),
                                           getPromo(), blurbId);
      appnet.api.updateChannel(oldChannel.id, channel, {include_annotations: 1},
                               success, null);
      $('#edit-room-modal').modal('hide');
    }
    enableEditRoom();
  }

  function createPmChannel(names)
  {
    var text = $('#edit-room-text').val();
    var message = { text: text,
                    destinations: names };
    appnet.api.createMessage('pm', message, { include_annotations: 1 },
                             completeCreatePm, failCreatePm);
  }

  function completeCreatePm(response)
  {
    util.redirect('room.html?channel=' + response.data.channel_id);
  }

  function failCreatePm(meta)
  {
    util.flagError('edit-room-error-div', 'Create PM Request Failed');
  }

  function createBlurb(channel, names, callback)
  {
    var name = $('#edit-room-name').val();
    var context = {
      channel: channel,
      names: names,
      callback: callback
    };
    var message = {
      text: getPromo(),
      annotations: [{
        type: 'net.app.core.channel.invite',
        value: {
          'channel_id': channel.id
        }
      }]
    };
    appnet.api.createMessage('1614', message, null,
                             $.proxy(completeBlurb, context),
                             failCreatePatter);
  }

  var completeBlurb = function (response)
  {
    changePatterChannel(this.channel, this.names, response.data.id,
                        this.callback);
  };

  function createPatterChannel(names)
  {
    var context = {
      names: names
    };
    var channel = {
      type: 'net.patter-app.room'
    };
    appnet.api.createChannel(channel, { include_annotations: 1 },
                             $.proxy(completeCreatePatter, context),
                             $.proxy(failCreatePatter, context));
  }

  var completeCreatePatter = function (response)
  {
    if (getPromo() === '') {
      changePatterChannel(response.data, this.names, null, redirectToChannel);
    } else {
      createBlurb(response.data, this.names, redirectToChannel);
    }
  };

  var failCreatePatter = function (meta)
  {
    if (this.blurbId)
    {
      appnet.api.deleteMessage('1614', this.blurbId, null, null, null);
    }
    util.flagError('edit-room-error-div', 'Create Patter Room Request Failed');
  };

  function redirectToChannel(response)
  {
    util.redirect('room.html?channel=' + response.data.id);
  }

  function clickSave(event) {
    event.preventDefault();
    if ($('#edit-room-name').val() === '' &&
        editRoomType === 'net.patter-app.room') {
      util.flagError('edit-room-error-div', 'You must specify a name');
    } else if ($('#edit-room-text').val() === '' &&
               editRoomType === 'net.app.core.pm') {
      util.flagError('edit-room-error-div', 'You must compose a message');
    } else {
      disableEditRoom();
      editRoomFields.checkNames(completeEditRoom);
    }
    return false;
  }

  return editRoomModal;
});
