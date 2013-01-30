// lobby.js
//
// Overall task for managing a list of subscribed channels

/*global require: true */
require(['jquery', 'js/util', 'js/appnet', 'js/editRoomModal'],
function ($, util, appnet, editRoomModal) {
  'use strict';

  var currentUser = null;
  var recentPostId = {};
  var hasNotified = false;

  function initialize() {
    if (! appnet.isLogged())
    {
      util.redirect('auth.html');
    }

//    $("#main-fail").hide();
//    $("#loading-modal").modal({backdrop: 'static',
//      keyboard: false});
    initButtons();
    appnet.updateUser(completeUserInfo, null);
  }

  function completeUserInfo(response) {
    currentUser = response.data;
//    $('#loading-message').html("Fetching Channels");
    processPublicChannels();
  }

  var publicChannels = [];
  var lastPublic = 0;
  var processChannelTimer = null;
  var channels = [];
  var shownChannels = false;
  var gettingPublic = true;

  function fetchEvent()
  {
    clearTimeout(processChannelTimer);
    processChannelTimer = setTimeout(fetchEvent, 45 * 1000);
    gettingPublic = true;
    channels = [];
    appnet.api.getChannelList(publicChannels, { include_annotations: 1 },
                              completeChannelList, failChannelList);
  }

  function processChannelList(minId)
  {
    var options = {
      include_annotations: 1,
      count: 200
    };
    if (minId)
    {
      options.before_id = minId;
    }
    appnet.api.getSubscriptions(options, completeChannelList, failChannelList);
  }

  function completeChannelList(response)
  {
    var minId = null;
    if (response.meta.more)
    {
      minId = response.meta.min_id;
    }
    channels = channels.concat(response.data);
    if (minId || gettingPublic)
    {
      gettingPublic = false;
      processChannelList(minId);
    }
    else
    {
      for (var i = 0; i < channels.length; i += 1) {
        channelMembers[channels[i].owner.id] = channels[i].owner;
        for (var j = 0; j < channels[i].writers.user_ids.length; j += 1)
        {
          var id = channels[i].writers.user_ids[j];
          if (channelMembers[id] === undefined) {
            channelMembers[id] = null;
          }
        }
      }
      getChannelMemberInfo();
    }
  }

  function failChannelList(response)
  {
  }

  function processPublicChannels()
  {
    var options = {
      include_annotations: 1,
      include_deleted: 0,
      count: 200
    };
    appnet.api.getMessages('1614', options, completePublicChannels, null);
  }

  function completePublicChannels(response)
  {
    publicChannels = ['1614'];
    lastPublic = response.meta.max_id;
    var i = 0;
    for (i = 0; i < response.data.length; i += 1)
    {
      var current = appnet.note.findChannelRefId(response.data[i]);
      if (current) {
        publicChannels.push(current);
      }
    }
    fetchEvent();
  }

  var channelMembers = {};

  function getChannelMemberInfo() {
    var ids = Object.keys(channelMembers);
    var needed = [];
    var count = 0;
    var i = 0;
    for (i = 0; i < ids.length; i += 1) {
      if (! channelMembers[ids[i]])
      {
        needed.push(ids[i]);
        count += 1;
        if (count >= 200)
        {
          break;
        }
      }
    }
    if (count > 0) {
      appnet.api.getUserList(needed, null, function (response) {
        for (var i = 0; i < response.data.length; i += 1) {
          channelMembers[response.data[i].id] = response.data[i];
        }
        getChannelMemberInfo();
      }, null);
    }
    renderAllChannels();
  }

  function renderAllChannels()
  {
    channels.sort(function (left, right) {
      var result = 0;
      if (left.recent_message_id && right.recent_message_id) {
        result = parseInt(right.recent_message_id, 10) -
          parseInt(left.recent_message_id, 10);
      } else if (left.recent_message_id) {
        result = -1;
      } else if (right.recent_message_id) {
        result = 1;
      }
      return result;
    });

    var mine = $('<div/>');
    var pm = $('<div/>');
    var other = $('<div/>');
    var lastId = 0;
    var i = 0;
    for (i = 0; i < channels.length; i += 1) {
      if (channels[i].id === '1614') {
        mine = mine;
//        if (! channels[i].is_deleted &&
//            channels[i].recent_message_id  > lastPublic) {
//          processPublicChannels();
//        }
      } else if (channels[i].type === 'net.patter-app.room') {
        if (lastId !== channels[i].id) {
          if (channels[i].you_subscribed) {
            mine.append(renderChannel(channels[i]));
          } else {
            other.append(renderChannel(channels[i]));
          }
        }
      } else {
        pm.append(renderChannel(channels[i]));
      }
      lastId = channels[i].id;
    }
    $('#patter-list .lobby-list-inner').html(mine.contents());
    $('#pm-list .lobby-list-inner').html(pm.contents());
    $('#public-list .lobby-list-inner').html(other.contents());
    if (! shownChannels) {
      //        $('#loading-modal').modal('hide');
      shownChannels = true;
    }
  }

  function renderChannel(channel)
  {
    var result = null;
    if (channel.type === 'net.app.core.pm') {
      result = renderPmChannel(channel);
    } else if (channel.type === 'net.patter-app.room') {
      result = renderPatterChannel(channel);
    }
    return result;
  }
  
  function renderPmChannel(channel)
  {
    var row = $('<div/>');
    var members = findChannelMembers(channel);
    
    row.addClass('row-fluid');
    
    row.append($('<div class="users"/>').append(renderMembers(members)));
    row.append($('<div class="user-pics"/>').append(renderThumbs(members)));
    
    var result = $('<a class="btn btn-large btn-block" href="room.html?channel=' + channel.id + '">');
    if (channel.has_unread) {
      result.addClass('btn-success');
    }
    result.append(row);
    return result;
  }

  function renderPatterChannel(channel)
  {
    var row = $('<div/>');
    var members = findChannelMembers(channel);
    var settings = appnet.note.findPatterSettings(channel);
    
    row.addClass('row-fluid');
    
    row.append($('<div class="channel-name"/>').append(renderChannelName(channel)));
    if (settings.blurb)
    {
      row.append($('<div class="span5"/>').append(util.htmlEncode(settings.blurb)));
    }
    else
    {
      row.append($('<div class="span5"/>').append(renderThumbs(members)));
    }
    row.append($('<div class="span2"/>').append(appnet.renderStatus(channel)));
    
    var result = $('<a class="btn btn-large btn-block" href="room.html?channel=' + channel.id + '">');
    if (channel.has_unread) {
      result.addClass('btn-success');
    }
    result.append(row);
    return result;
  }
  
  function renderChannelName(channel)
  {
    return $('<h4>' + util.htmlEncode(appnet.note.findPatterName(channel)) + '</h4>');
  }

  function renderThumbs(members)
  {
    var result = $('<div/>');
    for (var i = 0; i < members.length; i += 1) {
      result.append('<img class="avatarImg img-rounded" ' +
                    'width="30" height="30" src="' +
                    members[i].avatar + '" alt=""/>');
    }
    return result;
  }

  function renderMembers(members)
  {
    var result = $('<p/>');
    if (members.length > 0) {
      result.append(members[0].user);
      for (var i = 1; i < members.length; i += 1) {
        result.append(', ' + members[i].user);
      }
    }
    return result;
  }

  function findChannelMembers(channel)
  {
    var isPatter = (channel.type === 'net.patter-app.room');
    var members = [];
    if (channel.owner.id !== currentUser.id || isPatter) {
      members.push({ user: channel.owner.username,
                     avatar: channel.owner.avatar_image.url });
    }
    for (var i = 0; i < channel.writers.user_ids.length; i += 1)
    {
      var id = channel.writers.user_ids[i];
      if (channelMembers[id] &&
          (id !== currentUser.id || isPatter)) {
        members.push({user: channelMembers[id].username,
                      avatar: channelMembers[id].avatar_image.url});
      }
    }
    members.sort(function (left, right) {
      return left.user.localeCompare(right.user);
    });
    return members;
  }

  function initButtons() {
    editRoomModal.init();
    $('#create-patter-button').on('click', function (event) {
      event.preventDefault();
      editRoomModal.update(null, 'net.patter-app.room');
      editRoomModal.show();
      return false;
    });
    $('#create-pm-button').on('click', function (event) {
      event.preventDefault();
      editRoomModal.update(null, 'net.app.core.pm');
      editRoomModal.show();
      return false;
    });
    $('#logout-button').on('click', logout);
  }
  
  function logout(event)
  {
    event.preventDefault();
    $.removeCookie('patter2Token');
    util.redirect('index.html');
    return false;
  }

  $(document).ready(initialize);
});
