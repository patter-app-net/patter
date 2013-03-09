// lobby.js
//
// Overall task for managing a list of subscribed channels

/*global require: true */
require(['jquery', 'util', 'appnet', 'js/editRoomModal',
         'js/Category',
         'bootstrap', 'jquery-easydate'],
function ($, util, appnet, editRoomModal, Category) {
  'use strict';

  var wait = 1 * 1000;
  var checkWait = 30 * 1000;

  var cats = [new Category('fun', 'Fun'),
              new Category('lifestyle', 'Lifestyle'),
              new Category('profession', 'Professional'),
              new Category('language', 'Language/Region'),
              new Category('community', 'Community'),
              new Category('tech', 'Tech'),
              new Category('event', 'Event')];

  var currentUser = null;
  var recentPostId = {};
  var hasNotified = false;

  function initialize() {
    $.removeCookie('patterAccessToken', { path: '/' });
    appnet.init('patter2Token', 'patterPrevUrl');

    if (! appnet.isLogged())
    {
      util.redirect('auth.html');
    }

//    $("#main-fail").hide();
//    $("#loading-modal").modal({backdrop: 'static',
//      keyboard: false});
    initButtons();
    appnet.updateUser(completeUserInfo, failUserInfo);
  }

  function completeUserInfo(response) {
    currentUser = response.data;
//    $('#loading-message').html("Fetching Channels");
//    processPublicChannels();
    fetchEvent();
  }

  function sortChannels(channelList)
  {
    channelList.sort(function (left, right) {
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
  }

  function failUserInfo(meta) {
    util.redirect('auth.html');
  }

  var processChannelTimer = null;

  var publicChannels = [];
  var lastDirectoryCount;
  var channels = [];

  var shownChannels = false;
  var gettingPublic = false;
  var refreshPublic = true;

  var channelMembers = {};

  function fetchEvent()
  {
    var options = {
      include_annotations: 1,
      include_recent_message: 1,
      channel_types: 'net.app.core.pm,net.patter-app.room'
    };
    clearTimeout(processChannelTimer);
    processChannelTimer = setTimeout(fetchEvent, wait);
    if (shownChannels)
    {
      if (gettingPublic)
      {
        getPublicRooms();
      }
      else
      {
        appnet.api.getAllSubscriptions(options, processMyChannels,
                                       failChannelList);
      }
    }
    else
    {
      appnet.api.getSubscriptions(options, processMyChannels, failChannelList);
    }
    shownChannels = true;
    gettingPublic = ! gettingPublic;
  }

  function getPublicRooms()
  {
    if (refreshPublic)
    {
      appnet.api.getChannel('1614', { include_annotations: 1 },
                            processDirectory, failChannelList);
    }
    else
    {
      appnet.api.getAllChannelList(publicChannels, { include_annotations: 1, include_recent_message: 1 },
                                   processPublicChannels, failChannelList);
      wait = checkWait;
    }
    refreshPublic = ! refreshPublic;
  }

  function processMyChannels(response)
  {
    processUsers(response, $.proxy(processMine, response));
  }

  var processMine = function (response)
  {
    updateChannelUsers(response.data);

    sortChannels(this.data);
    var hasHome = false;
    var hasRoom = false;
    var hasPm = false;
    var home = $('<div class="span8"/>');
    home.append('<h3>Home</h3>');
    var rooms = $('<div class="span8"/>');
    rooms.append('<h3>My Rooms</h3>');
    var pms = $('<div class="span8"/>');
    pms.append('<h3>Private Messages</h3>');
    var i = 0;
    for (i = 0; i < this.data.length; i += 1)
    {
      if (i <= 8)
      {
        home.append(renderChannel(this.data[i]));
        if (this.data[i].has_unread)
        {
          hasHome = true;
        }
      }
      if (this.data[i].type === 'net.patter-app.room')
      {
        rooms.append(renderChannel(this.data[i]));
        if (this.data[i].has_unread)
        {
          hasRoom = true;
        }
      }
      else if (this.data[i].type === 'net.app.core.pm')
      {
        pms.append(renderChannel(this.data[i]));
        if (this.data[i].has_unread)
        {
          hasPm = true;
        }
      }
    }
    $('#home-wrapper').html(home);
    $('#rooms').html(rooms);
    $('#pms').html(pms);
    if (hasHome) {
      $('#home-tab').addClass('alert-success');
    } else {
      $('#home-tab').removeClass('alert-success');
    }
    if (hasRoom) {
      $('#room-tab').addClass('alert-success');
    } else {
      $('#room-tab').removeClass('alert-success');
    }
    if (hasPm) {
      $('#pm-tab').addClass('alert-success');
    } else {
      $('#pm-tab').removeClass('alert-success');
    }
  };

  function processDirectory(response)
  {
    var options = {
      include_annotations: 1,
      include_deleted: 0
    };
    if (response.data.counts.messages !== lastDirectoryCount)
    {
      lastDirectoryCount = response.data.counts.messages;
      appnet.api.getAllMessages('1614', options,
                                processDirectoryMessages, failChannelList);
    }
    else
    {
      appnet.api.getAllChannelList(publicChannels, { include_annotations: 1, include_recent_message: 1 },
                                   processPublicChannels, failChannelList);
    }
  }

  function processDirectoryMessages(response)
  {
    publicChannels = [];
    var i = 0;
    for (i = 0; i < response.data.length; i += 1)
    {
      var current = appnet.note.findChannelRefId(response.data[i]);
      if (! current) {
        var val = appnet.note.findAnnotation('net.app.core.channel.invite',
                                             response.data[i].annotations);
        if (val) {
          current = val.channel_id;
        }
      }
      if (current) {
        publicChannels.push(current);
      }
    }
    
    appnet.api.getAllChannelList(publicChannels, { include_annotations: 1 },
                                 processPublicChannels, failChannelList);
  }

  function processPublicChannels(response)
  {
    processUsers(response, $.proxy(processPublic, response));
  }

  var processPublic = function (response)
  {
    updateChannelUsers(response.data);

    sortChannels(this.data);
    var i = 0;
    var j = 0;
    var foundCat = false;
    var general = $('<div class="span8"/>');
    general.append('<h3>General Rooms</h3>');
    for (j = 0; j < cats.length; j += 1)
    {
      cats[j].tag = $('<div class="span8"/>');
      cats[j].tag.append('<h3>' + cats[j].title + '</h3>');
    }
    for (i = 0; i < this.data.length; i += 1)
    {
      foundCat = false;
      for (j = 0; j < cats.length; j += 1)
      {
        if (cats[j].match(this.data[i]))
        {
          foundCat = true;
          cats[j].tag.append(renderChannel(this.data[i]));
        }
      }
      if (! foundCat)
      {
        general.append(renderChannel(this.data[i]));
      }
    }
    for (j = 0; j < cats.length; j += 1)
    {
      cats[j].wrapper.html(cats[j].tag);
    }
    $('#general').html(general);
  };

  function processUsers(response, callback)
  {
    var users = [];
    var i = 0;
    for (i = 0; i < response.data.length; i += 1)
    {
      addUsers(response.data[i], users);
    }

    appnet.api.getAllUserList(users, {}, callback, failChannelList);
  }

  function addUsers(channel, users)
  {
    if (channel.owner)
    {
      channelMembers[channel.owner.id] = channel.owner;
    }
    for (var i = 0; i < channel.writers.user_ids.length; i += 1)
    {
      var id = channel.writers.user_ids[i];
      if (! channelMembers[id])
      {
        users.push(id);
      }
    }
  }

  function updateChannelUsers(users)
  {
    var i = 0;
    for (i = 0; i < users.length; i += 1)
    {
      channelMembers[users[i].id] = users[i];
    }
  }

//    gettingPublic = true;
//    channels = [];
//    appnet.api.getChannelList(publicChannels, { include_annotations: 1 },
//                              completeChannelList, failChannelList);
//  }
/*
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
*/
  function failChannelList(response)
  {
  }
/*
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
      if (! current) {
        var val = appnet.note.findAnnotation('net.app.core.channel.invite',
                                             response.data[i].annotations);
        if (val) {
          current = val.channel_id;
        }
      }
      if (current) {
        publicChannels.push(current);
      }
    }
    fetchEvent();
  }


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
    var mine = $('<div/>').append('<h3 class="muted">My Rooms</h3>');
    var pm = $('<div/>').append('<h3 class="muted">Private Messages</h3>');
    var other = $('<div/>').append('<h3 class="muted">Public Rooms</h3>');
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
    $('#patter-list').html(mine.contents());
    $('#pm-list').html(pm.contents());
    $('#public-list').html(other.contents());
    if (! shownChannels) {
      //        $('#loading-modal').modal('hide');
      shownChannels = true;
    }
  }
*/
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

    var timestamp = $('<div/>');
    if (channel.recent_message)
    {
      if (! channel.has_unread)
      {
        timestamp.addClass('muted');
      }
      timestamp.attr('title', channel.recent_message.created_at);
      timestamp.easydate({ live: false });
    }
    row.append($('<div class="span5"/>').append(renderMembers(members)));
    row.append($('<div class="span5"/>').append(renderThumbs(members)));
    row.append($('<div class="span2"/>').append(appnet.renderStatus(channel))
               .append('<br>')
               .append(timestamp));
    
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
    
    var timestamp = $('<div/>');
    if (channel.recent_message)
    {
      if (! channel.has_unread)
      {
        timestamp.addClass('muted');
      }
      timestamp.attr('title', channel.recent_message.created_at);
      timestamp.easydate({ live: false });
    }
    row.append($('<div class="span4"/>').append(renderChannelName(channel)));
    if (settings.blurb)
    {
      row.append($('<div class="span6"/>').append(util.htmlEncode(settings.blurb)));
    }
    else
    {
      row.append($('<div class="span6"/>').append(renderThumbs(members)));
    }
               
    row.append($('<div class="span2"/>').append(appnet.renderStatus(channel))
               .append('<br>')
               .append(timestamp));
    
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
                    'width="40" height="40" src="' +
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
    if ((channel.owner && channel.owner.id !== currentUser.id) ||
        isPatter) {
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
    delete localStorage.patter2Token;
    util.redirect('index.html');
    return false;
  }

  $(document).ready(initialize);
});
