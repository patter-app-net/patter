// RoomMenu.js
//
// Handlers for the menu bar

/*global define: true */
define(['jquery', 'appnet', 'js/core/roomInfo', 'js/core/editRoomModal',
        'js/core/OptionsView', 'js/core/OptionsModel',
        'js/deps/text!template/roomMenu.html',
        'js/deps/text!template/embeddedRoomMenu.html',
        'jquery-jfontsize', 'jquery-translator', 'bootstrap'],
function ($, appnet, roomInfo, editRoomModal, OptionsView, OptionsModel,
          menuTemplate, embeddedMenuTemplate) {
  'use strict';

  var roomMenu = {};

  var container;
  var header;

  var optionsView;
  var optionsModel;

  roomMenu.init = function (menuContainer, headerContainer, history)
  {
    container = menuContainer;
    header = headerContainer;
//    container.append((window.PATTER.embedded) ? embeddedMenuTemplate : menuTemplate);

//    initTranslate();
//    initNotify();
    container.find('#view').click(clickEditRoom);
    container.find('#subscribe').click(clickSubscribe);
    container.find('#help').click(clickHelp);
    container.find('#archive').click(clickArchive);
    container.find('#options-button').click(clickOptions);
//    initFontsize(history);
    editRoomModal.init();
    roomMenu.updateChannelView();

    optionsModel = new OptionsModel();
    optionsView = new OptionsView({ model: optionsModel,
                                    el: $('#options-wrapper') });
    optionsView.updateChat();
  };

  function initTranslate()
  {
    $(document).translatable({
      contentNodeSelector: '.chat-history',
      translateButtonSelector: '#translate-button'
    });
  }

  function initNotify()
  {
    var button = $('#notify-button', container);
    if (window.webkitNotifications &&
        window.webkitNotifications.checkPermission() !== 0) {
      button.show();
      button.click(clickNotify);
    } else {
      button.hide();
    }
  }

  function clickNotify(event)
  {
    event.preventDefault();
    window.webkitNotifications.requestPermission();
    $('#notify-button', container).hide();
    return false;
  }

  function clickEditRoom(event)
  {
    event.preventDefault();
    editRoomModal.update(roomInfo.channel);
    editRoomModal.show();
//    return false;
  }

  function clickSubscribe(event)
  {
    event.preventDefault();
    toggleSubscribe();
//    return false;
  }

  function clickHelp(event)
  {
    event.preventDefault();
    window.open('faq.html');
  }

  function clickArchive(event)
  {
    event.preventDefault();
    window.open('archive.html?channel=' + roomInfo.id);
  }

  function clickOptions(event)
  {
    event.preventDefault();
    optionsView.show();
  }

  function initFontsize(history)
  {
    $('#chat-display-row').jfontsize({
      btnMinusClasseId: '#jfontsize-minus',
      btnDefaultClasseId: '#jfontsize-default',
      btnPlusClasseId: '#jfontsize-plus',
      btnMinusMaxHits: 2,
      btnPlusMaxHits: 9,
      sizeChange: 3
    });
    var scrollMethod = $.proxy(history.scrollToBottom, history);
    $('#jfontsize-minus').click(scrollMethod);
    $('#jfontsize-default').click(scrollMethod);
    $('#jfontsize-plus').click(scrollMethod);
  }

  roomMenu.updateChannelView = function ()
  {
    // Setup room title
    var name = appnet.note.findPatterName(roomInfo.channel);
    if (! name)
    {
      name = 'Private Message';
    }
    var participants = 'Public Room';
    if (! roomInfo.channel.writers.any_user)
    {
      var count = roomInfo.channel.writers.user_ids.length + 1;
      participants = count + ' Participants';
      if (roomInfo.channel.readers.any_user ||
          roomInfo.channel.readers['public'])
      {
        participants += ' (Publicly Readable)';
      }
    }
    header.find('.room_title').html(name + '<span class="participants">' +
                                    participants + '</span>');

    // Setup subscribe button
    if (roomInfo.channel.you_muted)
    {
      container.find('#subscribe').html('Unmute');
    }
    else if (roomInfo.channel.you_subscribed)
    {
      container.find('#subscribe').html('Unsubscribe');
    }
    else
    {
      container.find('#subscribe').html('Subscribe');
    }

    // Setup archive button
    var settings = appnet.note.findAnnotation('net.patter-app.settings',
                                              roomInfo.channel.annotations);
    if (roomInfo.channel.readers['public'] && settings && settings.blurb_id)
    {
      container.find('#archive').show();
    }
    else
    {
      container.find('#archive').hide();
    }

    // Setup edit/view button
    if (editRoomModal.canEditChannel(roomInfo.channel))
    {
      container.find('#view').html('Edit Room');
    }
    else
    {
      container.find('#view').html('View Room');
    }
  };

  function toggleSubscribe()
  {
    if (roomInfo.channel.you_muted)
    {
      appnet.api.unmuteChannel(roomInfo.id, { include_annotations: 1 },
                               $.proxy(roomInfo.completeChannelInfo,
                                       roomInfo),
                               failToggleSubscribe);
    }
    else if (roomInfo.channel.you_subscribed)
    {
      appnet.api.deleteSubscription(roomInfo.id, { include_annotations: 1 },
                                    $.proxy(roomInfo.completeChannelInfo,
                                            roomInfo),
                                    failToggleSubscribe);
    }
    else
    {
      appnet.api.createSubscription(roomInfo.id, { include_annotations: 1 },
                                    $.proxy(roomInfo.completeChannelInfo,
                                            roomInfo),
                                    failToggleSubscribe);
    }
  }

  function failToggleSubscribe(response)
  {
  }

  return roomMenu;
});
