/*global define:true */
define(['jquery', 'underscore', 'backbone', 'js/options'],
function ($, _, Backbone, options)
{
  'use strict';

  var OptionsModel = Backbone.Model.extend({

    defaults: {
      smallChat: true
    },

    initialize: function () {
      var chat = true;
      if (options.settings.smallChat === false)
      {
        chat = false;
      }
      this.set({ smallChat: chat });
    },

    save: function () {
      options.settings.smallChat  = this.get('smallChat');
      options.saveSettings();
    }

  });

  return OptionsModel;
});
