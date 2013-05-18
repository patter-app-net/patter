// room.js
//
// Overall task for managing a room

/*global require: true */
require(['jquery', 'util', 'appnet', 'js/core/roomInfo', 'js/core/roomMenu',
         'js/core/RoomFeed'],
function ($, util, appnet, roomInfo, roomMenu, RoomFeed) {
  'use strict';

  var feed = null;

  function completeChannel()
  {
    if (roomInfo.channel !== null)
    {
      if (feed === null)
      {
        feed = new RoomFeed(roomInfo.channel, roomInfo.members,
                            $('.chat-input-row'), $('.user-list'),
                            $('.chat-history'));
        feed.checkFeed();
        roomMenu.init($('#room-menu'), feed.embed.history);
      }
      else
      {
        roomMenu.updateChannelView();
        feed.embed.user.updateChannel(roomInfo.channel, roomInfo.members);
      }
    }
    else
    {
      failChannel();
    }
  }

  function failChannel()
  {
    console.log('failChannel');
    util.redirect('index.html');
  }

  function failUser()
  {
    console.log('failUser');
    roomInfo.updateChannel();
  }

  function initialize()
  {
    var params = util.getUrlVars();
    var newRoom = params.channel;
    var hashParams = util.getHashParams();
    var token = hashParams.access_token;
    if (token)
    {
      appnet.api.accessToken = token;
      try
      {
        localStorage.patter2Token = token;
      }
      catch (e) { }
      window.location.hash = '';
    }
    else
    {
      appnet.init('patter2Token', 'patterPrevUrl');
    }
    if (! newRoom)
    {
      util.redirect('auth.html');
    }
    roomInfo.id = newRoom;
    roomInfo.changeCallback = completeChannel;
    if (appnet.isLogged())
    {
      appnet.updateUser($.proxy(roomInfo.updateChannel, roomInfo), failUser);
    }
    else
    {
      roomInfo.updateChannel();
    }
    if (window.PATTER.embedded && params.style) {
      $('body').prepend('<link rel="stylesheet" style="text/css"  href="' + params.style + '">');
    }
  }
/*

//function showMessage(

function initializePatter(newRoom) {
  $("#main-fail").hide();
  $("#form-post").hide();
  $("#must-authorize").hide();
  $("#read-only").hide();
  $("#loading-modal").modal({backdrop: 'static', keyboard: false});
  $(window).resize(scrollChatToBottom);
  chatRoom = newRoom;

  initButtons();
  initEmbedModal();
  initEditRoomModal();
  if (appnet.isLogged()) {
    $('#loading-message').html("Fetching User Information");
    appnet.updateUser(resetWindow, $.proxy(initFail, 'User Lookup'));
  } else {
    resetWindow();
  }
}

function initFail(meta) {
  $("#main-fail").show();
}

function initButtons() {
}

function resetWindow()
{
  clearTimeout(processTimer);
  currentChannel = null;
  namedUsers = {};
  userPostTimes = {};
  avatarUrls = {};
  lastUserList = "";
  if (appnet.user !== null) {
    namedUsers[appnet.user.username] = 1;
    userPostTimes[appnet.user.username] = null;
    avatarUrls[appnet.user.username] = appnet.user.avatar_image.url;
  }

  $("#main_post").val("");
  $("#global-tab-container").empty();
  $("#user-list").empty();

  if (! appnet.isLogged() && chatRoom === null) {
    appnet.api.authorize();
  } else if (chatRoom === null) {
    util.redirect("index.html");
  } else {
    getChannelInfo();
  }
}

*/
  $(document).ready(initialize);

});
