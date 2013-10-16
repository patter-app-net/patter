// RoomItemView.js
//
// A single room item row

/*global define:true */
define(['jquery', 'underscore', 'backbone', 'util', 'js/options',
        'js/core/allUsers',
        'js/deps/text!template/RoomItemView.html',
        'jquery-appnet'],
function ($, _, Backbone, util, options, allUsers, roomTemplateString)
{
  'use strict';

  var roomTemplate = _.template(roomTemplateString);

  // Options:
  //
  // showUnreadState -- This view should change based on unread status
  // showWhenMuted -- This view should display even when muted
  // showWhenUnsubscribed -- This view should display even when unsubscribed
  // hideWhenRead -- This view should hide read rooms

  var RoomItemView = Backbone.View.extend({

    tagName: 'tr',

    events: {
      'click #open': 'clickOpen',
      'click #subscribe': 'clickSubscribe',
      'click #mute': 'clickMute'
    },

    initialize: function () {
      this.listenTo(this.model, 'cleanup', this.remove);
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'actionBegin', this.actionBegin);
      this.listenTo(this.model, 'actionFail', this.actionFail);
    },

    render: function () {
      var shown = true;
      var channel = this.model.get('channel');
      if ((channel.you_subscribed || this.options.showWhenUnsubscribed) &&
          (! channel.you_muted || this.options.showWhenMuted) &&
          (channel.has_unread || ! this.options.hideWhenRead))
      {
        var settings = $.appnet.note.find('net.patter-app.settings',
                                          channel.annotations);
        var members = findChannelMembers(channel);
        var isRoom =  channel.type === 'net.patter-app.room';
        var data = {
          id: this.model.get('channel').id,
          isRoom: isRoom,
          name: getName(settings),
          members: getMemberText(members),
          blurb: getBlurb(settings),
          thumbs: members.slice(0, 6),
          time: this.getTime(),
          subscribed: this.model.get('channel').you_subscribed,
          muted: this.model.get('channel').you_muted
        };

        this.$el.html(roomTemplate(data));
        if (this.options.showUnreadState &&
            this.model.get('channel').has_unread)
        {
          this.$el.addClass('success');
        }
        else
        {
          this.$el.removeClass('success');
        }
        this.$('#loading').hide();
        this.$('#menu').show();
        this.$el.show();
      }
      else
      {
        this.$el.hide();
        shown = false;
      }
      return shown;
    },

    getTime: function ()
    {
      var result = '';
      if (this.model.get('channel').recent_message)
      {
        result = this.model.get('channel').recent_message.created_at;
      }
      return result;
    },

    clickOpen: function (event) {
      event.preventDefault();
      var url = this.$('#open').attr('href');
      if (options.settings.roomWindow)
      {
        window.open(url);
      }
      else
      {
        window.location = url;
      }
    },

    clickSubscribe: function (event) {
      event.preventDefault();
      this.model.toggleSubscribe();
      return false;
    },

    clickMute: function (event) {
      event.preventDefault();
      this.model.toggleMute();
      return false;
    },

    actionBegin: function () {
      this.$('#loading').show();
      this.$('#menu').hide();
    },

    actionFail: function (actionName) {
      this.$('#loading').hide();
      this.$('#menu').show();
      this.$('#failure-message').html('Failed to ' + actionName +
                                      ' this channel.');
      this.$('#failure').show();
      this.$('#menu .dropdown-toggle').dropdown('toggle');
    }

  });

  function findChannelMembers(channel)
  {
    var isPatter = (channel.type === 'net.patter-app.room');
    var members = [];
    if (channel.owner)/* &&
        (channel.owner.id !== currentUser.id || isPatter))*/
    {
      members.push({ user: channel.owner.username,
                     avatar: channel.owner.avatar_image.url });
    }
    var i = 0;
    for (i = 0; i < channel.writers.user_ids.length; i += 1)
    {
      var id = channel.writers.user_ids[i];
      var user = allUsers.lookup(id);
      if (user)/* &&
          (id !== currentUser.id || isPatter))*/
      {
        members.push({user: user.username,
                      avatar: user.avatar_image.url});
      }
    }
    members.sort(function (left, right) {
      return left.user.localeCompare(right.user);
    });
    return members;
  }

  function getName(settings) {
    var result = '';
    if (settings && settings.name)
    {
      result = settings.name;
    }
    return result;
  }

  function getBlurb(settings)
  {
    var result = '';
    if (settings && settings.blurb)
    {
      result = settings.blurb;
    }
    return result;
  }

  function getMemberText(members)
  {
    var result = '';
    if (members.length > 0) {
      result += members[0].user;
      var i = 1;
      for (i = 1; i < members.length; i += 1)
      {
        result += ', ' + members[i].user;
      }
    }
    return result;
  }

  return RoomItemView;
});
