// lobby.js
//
// Overall task for managing a list of subscribed channels

/*global require: true */
require(['jquery', 'appnet', 'util', 'js/options', 'js/core/editRoomModal',
         'js/core/RoomList', 'js/core/RoomListView',
         'js/deps/text!template/lobbyPm.html', 'js/deps/text!template/lobbyRoom.html',
         'bootstrap', 'jquery-easydate', 'jquery-appnet'],
function ($, appnet, util, options, editRoomModal, RoomList, RoomListView,
          pmString, roomString) {
  'use strict';

  var tagCloud = [
    {text:'fun',weight:183},
    {text:'lifestyle',weight:147},
    {text:'profession',weight:90},
    {text:'language',weight:104},
    {text:'community',weight:218},
    {text:'tech',weight:201},
    {text:'event',weight:58},
    {text:'general',weight:29}
  ];

  var checkWait = 30 * 1000;

  var pmTemplate = $(pmString);
  var roomTemplate = $(roomString);

  var currentUser = null;
  var recentPostId = {};
  var hasNotified = false;
  var autoRefresh = true;

  function initialize()
  {
    options.initialize();
    if (options.token)
    {
      appnet.api.accessToken = options.token;
      $.appnet.authorize(options.token);
      initLobby();
    }
    else
    {
      util.initAuthBody(options);
    }
  }

  function initLobby()
  {
    /*
    $('#search-rooms').submit(clickSearch);
    $('#recent-rooms').click(clickRecent);
    $('#active-rooms').click(clickActive);
    $('#home-tab').click(hideResults);
    $('#results-back').click(hideResults);
    $('#results-more').click(clickMoreResults);
    $('#refresh-wrapper').hide();
    $('#refresh-wrapper').removeClass('hidden');
    try
    {
      if (localStorage.autoRefresh === 'false')
      {
        toggleRefresh();
      }
    } catch (e) {}

     */
    initButtons();
    appnet.updateUser(completeUserInfo, failUserInfo);
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

  var channelMembers = {};

  var rooms = new RoomList({
    users: channelMembers
  });

  var pms = new RoomList({
    users: channelMembers
  });

  var searches = new RoomList({
    users: channelMembers
  });

  function completeUserInfo(response) {
    currentUser = response.data;

    $('#main-body').show();

    var roomView = new RoomListView({
      model: rooms,
      el: $('#rooms'),
      tabEl: $('#room-tab'),
      showUnread: true
    });
    rooms.reset(rooms.subscriptionMethod,
                { channel_types: 'net.patter-app.room' }, '');

    var pmView = new RoomListView({
      model: pms,
      el: $('#pms'),
      tabEl: $('#pm-tab'),
      showUnread: true
    });
    pms.reset(rooms.subscriptionMethod,
              { channel_types: 'net.app.core.pm' }, '');

    var searchView = new RoomListView({ model: searches, el: $('#search') });
    searches.reset(rooms.recentlyCreatedMethod, {}, '');

    $('#home-tab').click(hideSearch);
    $('#room-tab').click(hideSearch);
    $('#pm-tab').click(hideSearch);
    $('#room-tab').click(updateRooms);
    $('#pm-tab').click(updatePms);

    $('#search-rooms').submit(clickSearch);
    $('#recent-rooms').click(clickRecent);
    $('#active-rooms').click(clickActive);

    initTags();

    initUpdates();
  }

  function initTags()
  {
    var i = 0;
    for (i = 0; i < tagCloud.length; i += 1)
    {
      tagCloud[i].handlers = {
        click: makeHandler( tagCloud[i].text)
      };
      tagCloud[i].link = '#';
    }

    $('#tag-cloud').jQCloud(tagCloud, { removeOverflowing: false });
  }

  function makeHandler (text)
  {
    return function (event) {
      if (event)
      {
        event.preventDefault();
      }
      searchFor(text);
      return false;
    };
  }

  function hideSearch()
  {
    $('#search-tab').hide();
  }

  function updatePms()
  {
    pms.processUpdates();
  }

  function updateRooms()
  {
    rooms.processUpdates();
  }

  function clickSearch(event)
  {
    event.preventDefault();
    var text = $('#search-text');
    searchFor(text.val());
    text.val('');
  }

  function searchFor(text)
  {
    searches.reset(searches.searchMethod, { query: text },
                   'Search Results for "' + text + '"');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
  }

  function clickRecent(event)
  {
    event.preventDefault();
    searches.reset(searches.recentlyCreatedMethod, {},
                   'Recently Created Rooms');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
  }

  function clickActive(event)
  {
    event.preventDefault();
    event.preventDefault();
    searches.reset(searches.activeMethod, {},
                   'Active Patter Rooms');
    $('#search-tab').show();
    $('#search-tab-link').tab('show');
    searches.fetchMore();
  }

  function initUpdates()
  {
    update();
  }

  var updateSince = null;
  var updateTimer;
  var updatePoll = true;

  function update()
  {
    $('.timestamp').easydate({ live: false });
    clearTimeout(updateTimer);
    if (updatePoll)
    {
      updateTimer = setTimeout(update, checkWait);
    }
    var params = {
      include_annotations: 1,
      include_recent_message: 1,
      channel_types: 'net.app.core.pm,net.patter-app.room'
    };
    if (updateSince)
    {
      params.since_id = updateSince;
      params.count = -20;
    }

    var promise = $.appnet.channel.getUserSubscribed(params);
    promise.then(function (response) {
      if (response.meta.max_id)
      {
        updateSince = response.meta.max_id;
      }
      processUpdate(response.data, response.meta.min_id);
      var used = {};
      var channels = [];
      pms.getUnreadIdList(channels, used);
      rooms.getUnreadIdList(channels, used);
      return $.appnet.all.getChannelList(channels,
                                         { include_annotations: 1,
                                           include_recent_message: 1 });
    }).then(function (response) {
      var updates = [];
      var i = 0;
      for (i = 0; i < response.data.length; i += 1)
      {
        if (! response.data[i].has_unread)
        {
          updates.push(response.data[i]);
        }
      }
      processUpdate(updates);
    });
  }

  function processUpdate(updates, minId)
  {
    var pmUpdates = [];
    var roomUpdates = [];
    var i = 0;
    for (i = updates.length - 1; i >= 0; i -= 1)
    {
      var channel = updates[i];
      if (channel.type === 'net.app.core.pm')
      {
        pmUpdates.push(channel);
      }
      else if (channel.type === 'net.patter-app.room')
      {
        roomUpdates.push(channel);
      }
    }
    pms.addUpdates(pmUpdates, minId);
    rooms.addUpdates(roomUpdates, minId);
  }

  function toCountString(title, count)
  {
    var result = title;
    if (count > 0)
    {
      result += ' (' + count + ')';
    }
    return result;
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
//    util.redirect('auth.html');
  }

  var processChannelTimer = null;

  var publicChannels = [];
  var lastDirectoryCount;
  var channels = [];

  var shownChannels = false;
  var gettingPublic = false;
  var refreshPublic = true;

  function fetchEvent()
  {
    var options = {
      include_annotations: 1,
      include_recent_message: 1,
      channel_types: 'net.app.core.pm,net.patter-app.room'
    };
    clearTimeout(processChannelTimer);
    processChannelTimer = setTimeout(fetchEvent, checkWait);
    if (shownChannels)
    {
      appnet.api.getAllSubscriptions(options, processMyChannels,
                                     failChannelList);
    }
    else
    {
      appnet.api.getSubscriptions(options, processMyChannels, failChannelList);
    }
    shownChannels = true;
  }

  function processMyChannels(response)
  {
    processUsers(response, $.proxy(processMine, response));
  }

  var catWrapper = '<table class="table">';

  var processMine = function (response)
  {
    var homeCount = 0;
    updateChannelUsers(response.data);

    sortChannels(this.data);
    var hasHome = false;
    var hasRoom = false;
    var hasPm = false;
    var home = $(catWrapper);
    var rooms = $(catWrapper);
    rooms.append('<h3>My Rooms</h3>');
    var pms = $(catWrapper);
    pms.append('<h3>Private Messages</h3>');
    var added = 0;
    var i = 0;
    for (i = 0; i < this.data.length; i += 1)
    {
      if (! this.data[i].you_muted)
      {
        if (added < homeCount)
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
        added += 1;
      }
    }
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

  function failChannelList(response)
  {
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
    var result = pmTemplate.clone();
    var members = findChannelMembers(channel);

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
    result.find('#members').html(renderMembers(members));
    result.find('#thumbs').html(renderThumbs(members));
    var status = result.find('#status');
    status.append(timestamp);

    renderButtons(result, channel);
    return result;
  }

  function renderPatterChannel(channel)
  {
    var result = roomTemplate.clone();
    var members = findChannelMembers(channel);
    var settings = appnet.note.findPatterSettings(channel);

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
    result.find('#name').html(renderChannelName(channel));
    if (settings.blurb)
    {
      result.find('#blurb').html(util.htmlEncode(settings.blurb));
    }
    else
    {
      result.find('#blurb').html(renderThumbs(members.slice(0, 6)));
    }

    var status = result.find('#status');
    status.append(timestamp);

    renderButtons(result, channel);
    return result;
  }

  function renderButtons(result, channel)
  {
    result.find('#open').attr('href', 'room.html?channel=' + channel.id);
    if (channel.has_unread)
    {
      result.addClass('success');
    }
    if (channel.you_subscribed)
    {
      result.find('#subscribe').html('Unsubscribe');
      result.find('#mute').show();
    }
    else
    {
      result.find('#subscribe').html('Subscribe');
      result.find('#mute').hide();
    }
    var channelId = channel.id;
    var isSubscribed = channel.you_subscribed;
    result.find('#subscribe').click(function (event) {
      event.preventDefault();
      clickSubscribe(channelId, isSubscribed);
      return false;
    });
    result.find('#mute').click(function (event) {
      event.preventDefault();
      clickMute(channelId);
      return false;
    });
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
                    members[i].avatar + '" alt="Avatar for @' + members[i].user + '"/>');
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
    if (channel.owner &&
        (channel.owner.id !== currentUser.id || isPatter))
    {
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

  function clickSubscribe(channelId, isSubscribed)
  {
    var options = {
      include_annotations: 1,
      include_recent_message: 1
    };
    if (isSubscribed)
    {
      appnet.api.deleteSubscription(channelId, options,
                                    completeSubscribe, failSubscribe);
    }
    else
    {
      appnet.api.createSubscription(channelId, options,
                                    completeSubscribe, failSubscribe);
    }
  }

  function clickMute(channelId)
  {
    var options = {
      include_annotations: 1,
      include_recent_message: 1
    };
    appnet.api.muteChannel(channelId, options,
                           completeSubscribe, failSubscribe);
  }

  function completeSubscribe(response)
  {
    gettingPublic = false;
    fetchEvent();
    refreshPublic = false;
  }

  function failSubscribe(meta)
  {
  }

  function toggleRefresh(event)
  {
    if (event)
    {
      event.preventDefault();
    }
    autoRefresh = ! autoRefresh;
    if (autoRefresh)
    {
      fetchEvent();
      $('#auto-refresh').html('Auto-Refresh: On');
      $('#refresh-wrapper').hide();
    }
    else
    {
      clearTimeout(processChannelTimer);
      $('#auto-refresh').html('Auto-Refresh: Off');
      $('#refresh-wrapper').show();
    }
    localStorage.autoRefresh = autoRefresh;
    return false;
  }

  function clickRefresh(event)
  {
    event.preventDefault();
    fetchEvent();
    return false;
  }

  function logout(event)
  {
    event.preventDefault();
    delete localStorage.patter2Token;
    util.redirect('index.html');
    return false;
  }

  var findMethod;
  var findBefore;
  var findNext;

  function hideResults ()
  {
    $('#default-view').show();
    $('#results-view').hide();
  }

  function searchMethod(text)
  {
    var result = function(params) {
      params.query = text;
      params.creator_id = '137703';
      return $.appnet.post.search(params);
    };
    return result;
  }

  function recentMethod()
  {
    var result = function(params) {
      return $.appnet.post.getUser('@patter_rooms', params);
    };
    return result;
  }

  function activeMethod(params)
  {
    console.log('active');
    return $.appnet.core.call('http://test.patter-app.net/recent', 'GET', params);
  }
/*
  function clickSearch(event)
  {
    event.preventDefault();
    var text = $('#search-text').val();
    findBegin(searchMethod(text), processDirectory,
              'Searching for ' + text);
    $('#search-text').val('');
    return false;
  }

  function clickRecent(event)
  {
    event.preventDefault();
    findBegin(recentMethod(), processDirectory,
              'Searching for recently created rooms');
    return false;
  }

  function clickActive(event)
  {
    event.preventDefault();
    findBegin(activeMethod, processPublicChannels,
              'Searching for active rooms');
    return false;
  }
*/

  function findBegin(method, next, heading)
  {
    findMethod = method;
    findNext = next;
    findBefore = null;
    $('#default-view').hide();
    $('#results-heading').html(heading);
    $('#results-body').html('');
    $('#results-view').show();
    clickMoreResults();
  }

  function clickMoreResults()
  {
    $('#result-more').attr('disabled', 'disabled');
    var params = {
      include_deleted: 0,
      include_annotations: 1
    };
    if (findBefore)
    {
      params.before_id = findBefore;
    }
    findMethod(params).then(function (response) {
      if (response.meta.more)
      {
        $('#result-more').removeAttr('disabled');
      }
      return findNext(response);
    }, function (response) {
      $('#results-body').html('Search failed');
    });
  }

  function processDirectory(response)
  {
    findBefore = response.meta.min_id;
    var publicChannels = [];
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

    appnet.api.getAllChannelList(publicChannels, { include_annotations: 1, include_recent_message: 1 },
                                 processPublicChannels, failChannelList);
  }

  function processPublicChannels(response)
  {
    processUsers(response, $.proxy(processPublic, response));
  }

  var processPublic = function (response)
  {
    updateChannelUsers(response.data);

//    sortChannels(this.data);
    var someRendered = false;
    var i = 0;
    for (i = 0; i < this.data.length; i += 1)
    {
      if (! this.data[i].you_muted)
      {
        $('#results-body').append(renderChannel(this.data[i]));
        someRendered = true;
      }
    }
    if (! someRendered)
    {
      $('#results-body').html('No results found');
    }
  };

  $(document).ready(initialize);
});
