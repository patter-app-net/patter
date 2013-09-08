// room.js
//
// Overall task for managing a room

/*global require: true */
require(['jquery', 'util', 'appnet', 'js/options', 'js/core/roomInfo',
         'js/core/roomMenu', 'js/core/RoomFeed'],
function ($, util, appnet, options, roomInfo, roomMenu, RoomFeed) {
  'use strict';

  var feed = null;

  function completeChannel()
  {
    if (roomInfo.channel !== null)
    {
      $('#container').show();
      if (feed === null)
      {
        feed = new RoomFeed(roomInfo.channel, roomInfo.members,
                            $('#chatInput'), $('#users'),
                            $('#messages'));
        feed.checkFeed();
        roomMenu.init($('.menuBar'), $('#room_header'), feed.embed.history);
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
    failInit('Could not fetch this Patter room. Your connection may be down or you may not have permission to read it.');
  }

  function failUser()
  {
    failInit('Could fetch user information. Check your connection.');
  }

  function failInit(message)
  {
    if (appnet.isLogged())
    {
      $('#fail-modal #fail-body').html(message);
      $('#fail-modal').modal();
    }
    else
    {
      util.initAuthBody(options);
    }
  }

  function initialize()
  {
    options.initialize();
    if (options.token) {
      appnet.api.accessToken = options.token;
    }
    if (! options.channel)
    {
      failInit('There was no channel number in the room URL.');
    }
    else
    {
      roomInfo.id = options.channel;
      roomInfo.changeCallback = completeChannel;
      if (appnet.isLogged())
      {
        appnet.updateUser($.proxy(roomInfo.updateChannel, roomInfo), failUser);
      }
      else
      {
        roomInfo.updateChannel();
      }
    }
  }

  $(document).ready(initialize);

});
