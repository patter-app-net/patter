// RoomFeed.js
//
// Fetches latest messages from room channel periodically and uses a
// PatterEmbed to display them.

/*global define:true */
define(['jquery', 'util', 'appnet', 'js/PatterEmbed'],
function ($, util, appnet, PatterEmbed) {
  'use strict';

  function RoomFeed(channel, members, formRoot, userRoot, historyRoot)
  {
    this.embed = new PatterEmbed(channel, members, formRoot, userRoot,
                                 historyRoot, $.proxy(this.update, this), null);
    this.channel = channel;
    this.goBack = false;
    this.timer = null;
    this.earliest = null;
    this.latest = null;
    this.shownFeed = false;
    this.more = true;
    this.markerName = null;
  }

  RoomFeed.prototype.checkFeed = function ()
  {
    clearTimeout(this.timer);
    //    $('#loading-message').html("Fetching Messages From Channel");

    // Should the feed load older messages or newer ones.
    var scroll = this.embed.history.root.scrollTop();
    var height = this.embed.history.root.prop('scrollHeight');
    this.goBack = this.shownFeed && this.more && (scroll <= height / 3);

    var options = {
      include_annotations: 1,
      count: 200
    };

    if (! this.shownFeed) {
      options.count = 40;
    }
    if (this.goBack && this.earliest !== null) {
      options.before_id = this.earliest;
    }
    if (!this.goBack && this.latest !== null) {
      options.since_id = this.latest;
    }
    appnet.api.getMessages(this.channel.id, options,
                           $.proxy(completeFeed, this),
                           $.proxy(failFeed, this));
    this.timer = setTimeout($.proxy(this.checkFeed, this), 20000);
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

  return RoomFeed;
});
