// RoomList.js
//
// A backbone model for an embedded list of room information

/*global define:true */
define(['jquery', 'underscore', 'backbone',
        'js/core/allChannels', 'js/core/allUsers', 'jquery-appnet'],
function ($, _, Backbone, allChannels, allUsers)
{
  'use strict';

  var RoomList = Backbone.Model.extend({

    defaults: function () {
      return {
        title: '',
        rooms: [],
        updates: [],
        method: null,
        params: {},
        hasMore: true
      };
    },

    reset: function (newMethod, newParams, newTitle) {
      this.set({
        title: newTitle,
        rooms: [],
        updates: [],
        method: _.bind(newMethod, this),
        params: newParams,
        hasMore: true
      });
      this.trigger('reset');
    },

    getUnreadCount: function () {
      var list = [];
      var used = {};
      this.getUnreadIdList(list, used);
      return list.length;
    },

    getUnreadIdList: function(list, used) {
      var updates = this.get('updates').slice();
      updates.reverse();
      addUnreadIds(list, updates, used);
      addUnreadIds(list, this.get('rooms'), used);
    },

    // newRooms is a list of room models
    addUpdates: function (newRooms, minId) {
      var i = 0;
      for (i = 0; i < newRooms.length; i += 1)
      {
        if (this.get('updates').indexOf(newRooms[i]) === -1 &&
            this.get('rooms').indexOf(newRooms[i]) === -1)
        {
          this.get('updates').push(newRooms[i]);
        }
      }
      if (minId && ! this.get('params').before_id)
      {
        this.get('params').before_id = minId;
      }
      this.trigger('update', newRooms);
    },

    // Fold all updates into the rooms list and update appropriately
    processUpdates: function () {
      var newRooms = [];
      var used = {};
      var updates = this.get('updates').slice();
      if (updates.length > 0)
      {
        updates.reverse();
        addUpdatesToList(newRooms, updates, used);
        addUpdatesToList(newRooms, this.get('rooms'), used);
        sortChannels(newRooms);
        this.set({ rooms: newRooms, updates: [] });
        this.trigger('updateComplete');
      }
    },

    fetchMore: function() {
      this.trigger('fetchBegin');
      var newChannels;
      var that = this;
      var promise = this.get('method')();
      promise.then(function (response) {
        newChannels = response.data;
        return allUsers.fetchNewUsers(newChannels);
      }).then(function (response) {
        var added = [];
        var i = 0;
        for (i = 0; i < newChannels.length; i += 1)
        {
          var newItem = allChannels.add(newChannels[i]);
          that.get('rooms').push(newItem);
          added.push(newItem);
        }
        that.trigger('fetchSuccess', added);
      }, function (error) {
        that.trigger('fetchFail');
      });
    },

    searchChannelMethod: function () {
      this.get('params').include_annotations = 1;
      this.get('params').include_recent_message = 1;
      this.get('params').type = 'net.patter-app.room';
      var promise = $.appnet.channel.search(this.get('params'));
      return promise.then(updateMeta(this));
    },

    subscriptionMethod: function () {
      this.get('params').include_annotations = 1;
      this.get('params').include_recent_message = 1;
      var promise = $.appnet.channel.getUserSubscribed(this.get('params'));
      return promise.then(updateMeta(this));
    },

    activeMethod: function () {
      var that = this;
      this.get('params').include_annotations = 1;
      this.get('params').include_recent_message = 1;
      var promise = $.appnet.core.call('/recent',
                                       'GET', this.get('params'));
      return promise.then(updateMeta(this)).then(function (response) {
        var ids = [];
        var i = 0;
        for (i = 0; i < response.data.length; i += 1)
        {
          ids.push(response.data[i].id);
        }

        return $.appnet.channel.getList(ids, { include_annotations: 1,
                                               include_recent_message: 1 });
      });
    },

    searchMethod: function () {
      this.get('params').include_annotations = 1;
      this.get('params').creator_id = '137703';
      var promise = $.appnet.post.search(this.get('params'));
      return promise.then(updateMeta(this)).then(function (response) {
        return messagesToChannels(response);
      });
    },

    recentlyCreatedMethod: function () {
      this.get('params').include_deleted = 0;
      this.get('params').include_annotations = 1;
      var promise = $.appnet.post.getUser('@patter_rooms', this.get('params'));
      return promise.then(updateMeta(this)).then(function (response) {
        return messagesToChannels(response);
      });
    }
  });

  function roomsToChannels(list)
  {
    var result = [];
    var i = 0;
    for (i = 0; i < list.length; i += 1)
    {
      result.push(list[i].get('channel'));
    }
    return result;
  }

  function updateMeta(that)
  {
    return function (response) {
      if (response.meta.min_id)
      {
        that.get('params').before_id = response.meta.min_id;
      }
      that.set({ hasMore: response.meta.more });
      return response;
    };
  }

  function messagesToChannels(response)
  {
    var channelList = [];
    var i = 0;
    for (i = 0; i < response.data.length; i += 1)
    {
      var id = findChannelId(response.data[i]);
      if (id)
      {
        channelList.push(id);
      }
    }
    var params = {
      include_annotations: 1,
      include_recent_message: 1
    };
    return $.appnet.channel.getList(channelList, params);
  }

  function findChannelId(channel)
  {
    var result = null;
    var note = $.appnet.note.find('net.view-app.channel-ref',
                                  channel.annotations);
    if (note)
    {
      result = note.id;
    }
    if (! result)
    {
      note = $.appnet.note.find('net.app.core.channel.invite',
                                channel.annotations);
      if (note)
      {
        result = note.channel_id;
      }
    }
    return result;
  }

  function sortChannels(channelList)
  {
    channelList.sort(function (leftModel, rightModel) {
      var result = 0;
      var left = leftModel.get('channel');
      var right = rightModel.get('channel');
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

  // Add all the channels from rooms into newRooms, excluding those
  // that have already been used once.
  function addUpdatesToList(newRooms, rooms, used)
  {
    var i = 0;
    for (i = 0; i < rooms.length; i += 1)
    {
      var id = rooms[i].get('channel').id;
      if (! used[id])
      {
        used[id] = 1;
        newRooms.push(rooms[i]);
      }
      else
      {
        rooms[i].cleanup();
      }
    }
  }

  function addUnreadIds(newRooms, rooms, used)
  {
    var i = 0;
    for (i = 0; i < rooms.length; i += 1)
    {
      var id = rooms[i].get('channel').id;
      if (! used[id])
      {
        used[id] = 1;
        if (rooms[i].get('channel').has_unread)
        {
          newRooms.push(id);
        }
      }
    }
  }

  return RoomList;
});

