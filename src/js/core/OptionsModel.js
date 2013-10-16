/*global define:true */
define(['jquery', 'underscore', 'backbone', 'js/options'],
function ($, _, Backbone, options)
{
  'use strict';

  var OptionsModel = Backbone.Model.extend({

    defaults: {
      smallChat: true,
      roomWindow: false,
      everyTitle: true,
      everyNotify: false,
      everySound: false,
      mentionTitle: true,
      mentionNotify: false,
      mentionSound: false
    },

    initialize: function () {
      var newModel = {};
      var list = ['smallChat', 'roomWindow',
                  'everyTitle', 'everyNotify', 'everySound',
                  'mentionTitle', 'mentionNotify', 'mentionSound'];
      var i = 0;
      for (i = 0; i < list.length; i += 1)
      {
        if (options.settings[list[i]] !== undefined &&
            options.settings[list[i]] !== null)
        {
          newModel[list[i]] = options.settings[list[i]];
        }
      }
      this.set(newModel);
    },

    save: function () {
      options.settings = this.toJSON();
      options.saveSettings();
    }

  });

  return OptionsModel;
});
