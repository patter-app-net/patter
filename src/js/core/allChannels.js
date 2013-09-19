// allChannels.js
//
// A global container for all RoomItem models.

/*global define:true */
define(['jquery', 'underscore', 'backbone', 'js/core/RoomItem'],
function ($, _, Backbone, RoomItem)
{
  'use strict';

  var channels = {};

  var allChannels = {

    lookup: function (id)
    {
      return channels[id];
    },

    add: function (newChannel)
    {
      var id = newChannel.id;
      var result;
      var old = channels[id];
      if (old)
      {
        old.set({ channel: newChannel });
        result = old;
      }
      else
      {
        result = new RoomItem({ channel: newChannel });
        channels[id] = result;
      }
      this.trigger('update', result);
      return result;
    }

  };

  _.extend(allChannels, Backbone.Events);

  return allChannels;
});
