// lobby.js
//
// Overall task for managing a list of subscribed channels

/*global require: true */
require(['jquery', 'appnet', 'util', 'js/options', 'js/core/editRoomModal',
         'js/core/RoomList', 'js/core/RoomListView',
         'bootstrap', 'jquery-cloud', 'jquery-appnet'],
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

  var currentUser = null;

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

    var searchView = new RoomListView({
      model: searches,
      el: $('#search'),
      showWhenUnsubscribed: true
    });
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
    util.formatTimestamp($('.timestamp'));
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

  function failUserInfo(meta) {
//    util.redirect('auth.html');
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
//    fetchEvent();
  }

  function failSubscribe(meta)
  {
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
