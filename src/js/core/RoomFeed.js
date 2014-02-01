// RoomFeed.js
//
// Fetches latest messages from room channel periodically and uses a
// PatterEmbed to display them.

/*global define:true */
define(['jquery', 'util', 'appnet', 'js/core/PatterEmbed'],
function ($, util, appnet, PatterEmbed) {
  'use strict';

  function RoomFeed(channel, members, formRoot, userRoot, historyRoot)
  {
    this.embed = new PatterEmbed(channel, members, formRoot, userRoot,
                                 historyRoot, $.proxy(this.update, this),
                                 $.proxy(this.mute, this)/*,
                                 $.proxy(this.deleteMessage, this)*/);
    this.channel = channel;
    this.goBack = false;
    this.timer = null;
    this.earliest = null;
    this.latest = null;
    this.shownFeed = false;
    this.more = true;
    this.markerName = null;

    this.connectionId = null;
    this.webSocketActive = false;
    this.dontUseWebSocket = false;
    this.webSocket = null;
    this.subscriptionId = null;
  }

  function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = ((d + Math.random()*16)%16 | 0);
      d = Math.floor(d/16);
      return (c==='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
  }

  RoomFeed.prototype.getConnectionId = function (callback)
  {
    var roomFeed, streamUrl;

    if (!this.usingWebSocket()) {
      return false;
    }

    if (!this.subscriptionId) {
      this.subscriptionId = generateUUID();
    }

    streamUrl = 'wss://stream-channel.app.net/stream/user?include_annotations=1&include_html=1&include_marker=1&include_recent_message=1&include_html=1&auto_delete=1&access_token=' + appnet.api.accessToken;

    if (this.connectionId !== null) {
      if (this.webSocketActive) {
        return callback(this.connectionId);
      } else {
        streamUrl += '&connection_id=' + this.connectionId;
      }
    }

    this.webSocket = new WebSocket(streamUrl);

    roomFeed = this;

    this.webSocket.onopen = function (e) {
      roomFeed.webSocketActive = true;

      if ($('#room_header .room_title .ws_active_indicator').length === 0) {
        $('<span class="ws_active_indicator"></span>').appendTo('#room_header .room_title');
      }
    };

    this.webSocket.onmessage = function (e) {
      var payload = JSON.parse(e.data);

      if (payload.meta.connection_id) {
        roomFeed.connectionId = payload.meta.connection_id;

        callback(roomFeed.connectionId);
      }

      if (payload.data !== void 0 && payload.data.length >= 1) {
        roomFeed.update(payload.data, payload.meta.marker, payload.meta.max_id);
      }
    };

    this.webSocket.onclose = function (e) {
      roomFeed.dontUseWebSocket = true;
      roomFeed.webSocketActive = false;
      roomFeed.connectionId = null;

      // Fall back to polling.
      roomFeed.checkFeed();

      // Remove the indicator.
      $('#room_header .room_title .ws_active_indicator').remove();
    };

    this.webSocket.onerror = function (e) {
      roomFeed.dontUseWebSocket = true;
      roomFeed.webSocketActive = false;
      roomFeed.connectionId = null;

      // Fall back to polling.
      roomFeed.checkFeed();

      // Remove the indicator.
      $('#room_header .room_title .ws_active_indicator').remove();
    };
  };

  RoomFeed.prototype.checkFeed = function ()
  {
    var scroll, height, options, requiresPoll, roomFeed;
    var that = this;

    roomFeed = this;

    requiresPoll = false;

    // Should the feed load older messages or newer ones.
    scroll = this.embed.history.root.scrollTop();
    height = this.embed.history.root.prop('scrollHeight');
    this.goBack = this.shownFeed && this.more && (scroll <= height / 3);
    //    this.goBack = false;

    options = {
      include_annotations: 1,
      count: 200
    };

    if (! this.shownFeed) {
      options.count = 40;
      requiresPoll = true;
    }

    if (this.goBack && this.earliest !== null) {
      options.before_id = this.earliest;
      requiresPoll = true;
    }

    if (!this.goBack && this.latest !== null) {
      options.since_id = this.latest;
    }

    if (this.usingWebSocket()) {
      if (this.webSocketActive) { return; }

      this.getConnectionId(function(connectionId) {
        if (! that.shownFeed)
        {
          options = {
            connection_id: connectionId,
            include_annotations: 1,
            count: 40,
            subscription_id: roomFeed.subscriptionId
          };

          appnet.api.getMessages(roomFeed.channel.id, options,
                                 $.proxy(completeFeed, roomFeed),
                                 $.proxy(failFeed, roomFeed));
        }
      });

    } else {
      clearTimeout(this.timer);

      // $('#loading-message').html("Fetching Messages From Channel");

      appnet.api.getMessages(this.channel.id, options,
                             $.proxy(completeFeed, this),
                             $.proxy(failFeed, this));

      this.timer = setTimeout($.proxy(this.checkFeed, this), 20000);
    }
  };

  var completeFeed = function (response)
  {
    clearTimeout(this.timer);
    if (this.goBack && ! response.meta.more) {
      this.more = false;
    }
    if (response.meta.min_id !== undefined) {
      if (this.earliest === null || response.meta.min_id < this.earliest) {
        this.earliest = response.meta.min_id;
      }
    }
    if (response.meta.max_id !== undefined) {
      if (this.latest === null || response.meta.max_id > this.latest) {
        this.latest = response.meta.max_id;
      }
    }

    this.update(response.data, response.meta.marker, response.meta.max_id);

    if (! this.shownFeed) {
      this.shownFeed = true;
    }
    this.embed.history.checkBottom();
    var time = 2000;
    if (! util.has_focus) {
      time = 10000;
    }

    this.timer = setTimeout($.proxy(this.checkFeed, this), time);
  };

  RoomFeed.prototype.update = function (posts, marker, inMaxId)
  {
    var maxId = inMaxId;
    if (! maxId)
    {
      if (posts.length > 0)
      {
        maxId = posts[0].id;
      }
    }

    this.embed.addPosts(posts, this.goBack);

    if (marker)
    {
      this.markerName = marker.name;
    }
    if (maxId && this.markerName &&
        (! marker || ! marker.id ||
         parseInt(maxId, 10) > parseInt(marker.id, 10)))
    {
      changeMarker(this.markerName, maxId);
    }
  };

  var failFeed = function (meta)
  {
  };

  function changeMarker(markerName, id)
  {
    if (markerName !== null && id !== null)
    {
      var marker = {
        id: id,
        name: markerName
      };
      appnet.api.updateMarker(marker, null, null, null);
    }
  }

  RoomFeed.prototype.mute = function (userId)
  {
  };

  RoomFeed.prototype.usingWebSocket = function ()
  {
    return (('WebSocket' in window) && !this.dontUseWebSocket) ? true : false;
  };
/*
  RoomFeed.prototype.deleteMessage = function (messageId, complete, failure)
  {
    var context = {
      messageId: messageId,
      complete: complete,
      failure: failure
    };
    appnet.api.deleteMessage(this.channel.id, messageId,
                             $.proxy(completeDelete, context),
                            $.proxy(failDelete, context));
  };

  var completeDelete = function (response)
  {
    this.complete(this.messageId);
  };

  var failDelete = function (meta)
  {
    this.failure(this.messageId, meta);
  };

*/

  return RoomFeed;
});
