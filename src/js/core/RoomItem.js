// RoomItem.js
//
// Model for a single room in a list

/*global define:true */
define(['jquery', 'underscore', 'backbone', 'jquery-appnet'],
function ($, _, Backbone)
{
  'use strict';

  var RoomItem = Backbone.Model.extend({

    defaults: {
      channel: null
    },

    cleanup: function (root) {
      this.trigger('cleanup');
    },

    toggleSubscribe: function () {
      if (this.get('channel').you_subscribed)
      {
        this.performAction($.appnet.channel.unsubscribe, 'unsubscribe');
      }
      else
      {
        this.performAction($.appnet.channel.subscribe, 'subscribe');
      }
    },

    toggleMute: function () {
      if (this.get('channel').you_muted)
      {
        this.performAction($.appnet.channel.unmute, 'unmute');
      }
      else
      {
        this.performAction($.appnet.channel.mute, 'mute');
      }
    },

    performAction: function (f, name) {
      this.trigger('actionBegin');
      var id = this.get('channel').id;
      var options = {
        include_annotations: 1,
        include_recent_message: 1
      };
      var that = this;
      var promise = f(id, options);
      promise.then(function (response) {
        that.set({ channel: response.data });
      }, function (error) {
        that.trigger('actionFail', name);
      });
    }

  });

  return RoomItem;
});
