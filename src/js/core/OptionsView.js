/*global define:true */
define(['jquery', 'underscore', 'backbone',
        'js/deps/text!template/OptionsModal.html'],
function ($, _, Backbone, modalString)
{
  'use strict';

  var OptionsView = Backbone.View.extend({

    tagName: 'div',

    events: {
      'click #save': 'clickSave'
    },

    initialize: function () {
      this.listenTo(this.model, 'change:smallChat', this.updateChat);
      this.$el.html(modalString);
    },

    render: function () {
      this.updateChat();
    },

    show: function () {
      this.render();
      this.$('#options-modal').modal('show');
    },

    updateChat: function () {
      var chat = this.model.get('smallChat');
      if (chat)
      {
        $('footer').css('height', '50px');
        $('#messages').css('bottom', '50px');
        $('#users').css('bottom', '50px');
        $('#chatInput #chatBox').show();
        $('#chatInput #chatBox').val('');
        $('#chatInput #textBox').hide();
        $('#chatInput #textBox').val('');
        this.$('#toggle-chat').attr('checked');
      }
      else
      {
        $('footer').css('height', '100px');
        $('#messages').css('bottom', '100px');
        $('#users').css('bottom', '100px');
        $('#chatInput #chatBox').hide();
        $('#chatInput #chatBox').val('');
        $('#chatInput #textBox').show();
        $('#chatInput #textBox').val('');
        this.$('#toggle-chat').removeAttr('checked');
      }
    },

    clickSave: function () {
      var chat = false;
      if (this.$('#toggle-chat').attr('checked'))
      {
        chat = true;
      }
      this.model.set({ smallChat: chat });
      this.model.save();
    }

  });

  return OptionsView;
});
