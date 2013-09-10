// RoomList.js
//
// A backbone model for an embedded list of room information

/*global define:true */
define(['jquery', 'underscore', 'backbone', 'jquery-appnet'],
function ($, _, Backbone)
{
  'use strict';

  var RoomList = Backbone.Model.extend({

    defaults: function () {
      return {
        title: '',
        rooms: [],
        updates: [],
        users: null,
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

    addUpdates: function (newRooms, minId) {
      var i = 0;
      for (i = 0; i < newRooms.length; i += 1)
      {
        this.get('updates').push(newRooms[i]);
      }
      if (minId && ! this.get('params').before_id)
      {
        this.get('params').before_id = minId;
      }
      var that = this;
      this.fetchNewUsers(newRooms).then(function () {
        that.trigger('update');
      });
    },

    processUpdates: function () {
      var newRooms = [];
      var used = {};
      var updates = this.get('updates').slice();
      if (updates.length > 0)
      {
        updates.reverse();
        addUpdates(newRooms, updates, used);
        addUpdates(newRooms, this.get('rooms'), used);
        sortChannels(newRooms);
        this.set({ rooms: newRooms, updates: [] });
        var that = this;
        this.fetchNewUsers(newRooms).then(function () {
          that.trigger('updateComplete');
        });
      }
    },

    fetchMore: function() {
      this.trigger('fetchBegin');
      var newChannels;
      var that = this;
      var promise = this.get('method')();
      promise.then(function (response) {
        newChannels = response.data;
        return that.fetchNewUsers(newChannels);
      }).then(function (response) {
        that.set({ rooms: that.get('rooms').concat(newChannels) });
        that.trigger('fetchSuccess', newChannels);
      }, function (error) {
        that.trigger('fetchFail');
      });
    },

    fetchNewUsers: function (channels) {
      var newUsers = this.findNewUserList(channels);
      if (newUsers.length > 0)
      {
        var that = this;
        return $.appnet.user.getList(newUsers).then(function (response) {
          that.updateUserList(response.data);
        });
      }
      else
      {
        return $.when(null);
      }
    },

    findNewUserList: function (channels) {
      var result = [];
      var i = 0;
      for (i = 0; i < channels.length; i += 1)
      {
        var channel = channels[i];
        if (channel.owner)
        {
          this.get('users')[channel.owner.id] = channel.owner;
        }
        var j = 0;
        for (j = 0; j < channel.writers.user_ids.length; j += 1)
        {
          var id = channel.writers.user_ids[j];
          if (! this.get('users')[id])
          {
            result.push(id);
          }
        }
      }
      return result;
    },

    updateUserList: function (newUsers) {
      var i = 0;
      for (i = 0; i < newUsers.length; i += 1)
      {
        this.get('users')[newUsers[i].id] = newUsers[i];
      }
    },

    subscriptionMethod: function () {
      this.get('params').include_annotations = 1;
      this.get('params').include_recent_message = 1;
      var promise = $.appnet.channel.getUserSubscribed(this.get('params'));
      return promise.then(updateMeta(this));
    },

    activeMethod: function () {
      this.get('params').include_annotations = 1;
      this.get('params').include_recent_message = 1;
      var promise = $.appnet.core.call('/recent',
                                       'GET', this.get('params'));
      return promise.then(updateMeta(this));
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

  // Add all the channels from rooms into newRooms, excluding those
  // that have already been used once.
  function addUpdates(newRooms, rooms, used)
  {
    var i = 0;
    for (i = 0; i < rooms.length; i += 1)
    {
      if (! used[rooms[i].id])
      {
        used[rooms[i].id] = 1;
        newRooms.push(rooms[i]);
      }
    }
  }

  function addUnreadIds(newRooms, rooms, used)
  {
    var i = 0;
    for (i = 0; i < rooms.length; i += 1)
    {
      if (! used[rooms[i].id])
      {
        used[rooms[i].id] = 1;
        if (rooms[i].has_unread)
        {
          newRooms.push(rooms[i].id);
        }
      }
    }
  }

  return RoomList;
});

