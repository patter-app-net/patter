/*global define:true */
define(['jquery', 'underscore', 'backbone',
        'js/deps/text!template/OptionsModal.html',
        'jquery-desknoty'],
function ($, _, Backbone, modalString)
{
  'use strict';

  var checkBoxes = ['roomWindow', 'smallChat',
                    'everyTitle', 'everyNotify', 'everySound',
                    'mentionTitle', 'mentionNotify', 'mentionSound'];

  var OptionsView = Backbone.View.extend({

    tagName: 'div',

    events: {
      'click #save': 'clickSave',
      'click #test-notify': 'clickTestNotify',
      'click #everyNotify': 'clickToggleNotify',
      'click #mentionNotify': 'clickToggleNotify'
    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.$el.html(modalString);
    },

    render: function () {
      this.updateChat();
      this.updateBoxes();
      if (window.webkitNotifications)
      {
        $('#test-notify').button('reset');
      }
      else
      {
        $('#test-notify').button('loading');
      }
    },

    updateBoxes: function () {
      var i = 0;
      for (i = 0; i < checkBoxes.length; i += 1)
      {
        var key = checkBoxes[i];
        if (this.model.get(key))
        {
          this.$('#' + key).attr('checked', true);
        }
        else
        {
          this.$('#' + key).removeAttr('checked');
        }
      }
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
      }
    },

    clickSave: function () {
      var newModel = {};
      var i = 0;
      for (i = 0; i < checkBoxes.length; i += 1)
      {
        var key = checkBoxes[i];
        var val = false;
        if (this.$('#' + key).attr('checked'))
        {
          val = true;
        }
        newModel[key] = val;
      }

      this.model.set(newModel);
      this.model.save();
    },

    clickToggleNotify: function (event) {
      this.tryNotify('You just toggled in-room notifications.');
    },

    clickTestNotify: function (event) {
      event.preventDefault();
      this.tryNotify('This is a test of the browser notification system. It is only a test.');
    },

    tryNotify: function (message) {
      if (window.webkitNotifications)
      {
        window.webkitNotifications.requestPermission();
        $.desknoty({
          icon: '/images/patter-top-mobile.png',
          title: 'Patter Notification',
          body: message,
          url: ''
        });
      }
      if (window.fluid)
      {
        window.fluid.showGrowlNotification({
          icon: '/images/patter-top-mobile.png',
          title: 'Patter Notification',
          description: message,
          sticky: false
        });
      }
    }

  });

  return OptionsView;
});
