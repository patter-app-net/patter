// RoomListView.js
//
// A backbone view for an embedded list of room information

/*global define:true */
define(['jquery', 'underscore', 'backbone', 'util',
        'js/deps/text!template/RoomListView.html',
        'js/deps/text!template/lobbyPm.html',
        'js/deps/text!template/lobbyRoom.html',
        'jquery-appnet', 'jquery-cloud'],
function ($, _, Backbone, util, listTemplateString,
          pmTemplateString, roomTemplateString)
{
  'use strict';

  var pmTemplate = _.template(pmTemplateString);
  var roomTemplate = _.template(roomTemplateString);

  var RoomListView = Backbone.View.extend({

    tagName: 'div',

    className: 'room-list',

    events: {
      'click #more': 'clickMore',
      'click #update': 'clickUpdate'
    },

    initialize: function () {
      this.$el.html(listTemplateString);
      this.listenTo(this.model, 'reset', this.render);
      this.listenTo(this.model, 'fetchBegin', this.fetchBegin);
      this.listenTo(this.model, 'fetchSuccess', this.fetchSuccess);
      this.listenTo(this.model, 'fetchFail', this.fetchFail);
      this.listenTo(this.model, 'update', this.renderUpdate);
      this.listenTo(this.model, 'updateComplete', this.render);
    },

    render: function () {
      this.$('#head').html(util.htmlEncode(this.model.get('title')));
      this.renderUpdate();
      this.$('#body').html('');
      this.$('#loading').hide();
      this.renderRooms(this.model.get('rooms'));
      this.renderTab();
      return this;
    },

    renderUpdate: function () {
      if (this.model.get('updates').length > 0)
      {
        this.$('#update').html(this.model.get('updates').length + ' Updates');
        this.$('#update').show();
        this.$('#none-found').hide();
      }
      else
      {
        this.$('#update').hide();
      }
      this.renderTab();
    },

    renderTab: function () {
      if (this.options.tabEl)
      {
        var tab = this.options.tabEl;
        var count = this.model.getUnreadCount();
        if (count > 0)
        {
          tab.find('#unread').html(count);
          tab.find('#unread').show();
        }
        else
        {
          tab.find('#unread').hide();
        }
      }
    },

    fetchBegin: function () {
      this.$('#loading').show();
      this.$('#more').button('loading');
      this.$('#none-found').hide();
    },

    fetchSuccess: function (newRooms) {
      this.$('#loading').hide();
      this.$('#more').button('reset');
      this.renderRooms(newRooms);
      this.renderTab();
    },

    fetchFail: function () {
      this.$('#loading').hide();
      this.$('#more').button('failed');
    },

    clickMore: function (event) {
      event.preventDefault();
      this.model.fetchMore();
    },

    clickUpdate: function (event) {
      event.preventDefault();
      this.model.processUpdates();
    },

    renderRooms: function (rooms) {
      var i = 0;
      var hasShown = false;
      for (i = 0; i < rooms.length; i += 1)
      {
        if (! rooms[i].you_muted)
        {
          this.$('#body').append(renderChannel(rooms[i],
                                               this.model.get('users'),
                                               this.options.showUnread));
          hasShown = true;
        }
      }
      if (! hasShown && this.model.get('updates').length === 0)
      {
        this.$('#none-found').show();
      }
      else
      {
        this.$('#none-found').hide();
      }
      if (this.model.get('hasMore'))
      {
        this.$('#more').show();
      }
      else
      {
        this.$('#more').hide();
      }
    }


  });

  function renderChannel(channel, channelMembers, showUnread)
  {
    var result = null;
    if (channel.type === 'net.app.core.pm') {
      result = renderPmChannel(channel, channelMembers, showUnread);
    } else if (channel.type === 'net.patter-app.room') {
      result = renderPatterChannel(channel, channelMembers, showUnread);
    }
    return result;
  }

  function renderPmChannel(channel, channelMembers, showUnread)
  {
    var result = $(pmTemplate());
    var members = findChannelMembers(channel, channelMembers);

    var timestamp = $('<div/>');
    if (channel.recent_message)
    {
      if (! channel.has_unread)
      {
        timestamp.addClass('muted');
      }
      timestamp.attr('title', channel.recent_message.created_at);
      timestamp.easydate({ live: false });
    }
    result.find('#members').html(renderMembers(members));
    result.find('#thumbs').html(renderThumbs(members));
    var status = result.find('#status');
    status.append(timestamp);

    renderButtons(result, channel, showUnread);
    return result;
  }

  function renderPatterChannel(channel, channelMembers, showUnread)
  {
    var result = $(roomTemplate());
    var members = findChannelMembers(channel, channelMembers);
    var settings = $.appnet.note.find('net.patter-app.settings',
                                      channel.annotations);

    var timestamp = $('<div/>');
    if (channel.recent_message)
    {
      if (! channel.has_unread)
      {
        timestamp.addClass('muted');
      }
      timestamp.attr('title', channel.recent_message.created_at);
      timestamp.easydate({ live: false });
      timestamp.addClass('timestamp');
    }
    result.find('#name').html(renderChannelName(settings));
    if (settings.blurb)
    {
      result.find('#blurb').html(util.htmlEncode(settings.blurb));
    }
    else
    {
      result.find('#blurb').html(renderThumbs(members.slice(0, 6)));
    }

    var status = result.find('#status');
    status.append(timestamp);

    renderButtons(result, channel, showUnread);
    return result;
  }


  function renderButtons(result, channel, showUnread)
  {
    result.find('#open').attr('href', 'room.html?channel=' + channel.id);
    if (channel.has_unread && showUnread)
    {
      result.addClass('success');
    }
    if (channel.you_subscribed)
    {
      result.find('#subscribe').html('Unsubscribe');
      result.find('#mute').show();
    }
    else
    {
      result.find('#subscribe').html('Subscribe');
      result.find('#mute').hide();
    }
    var channelId = channel.id;
    var isSubscribed = channel.you_subscribed;
    result.find('#subscribe').click(function (event) {
      event.preventDefault();
//      clickSubscribe(channelId, isSubscribed);
      return false;
    });
    result.find('#mute').click(function (event) {
      event.preventDefault();
//      clickMute(channelId);
      return false;
    });
  }

  function renderChannelName(settings)
  {
    return $('<h4>' + util.htmlEncode(settings.name) + '</h4>');
  }

  function renderThumbs(members)
  {
    var result = $('<div/>');
    for (var i = 0; i < members.length; i += 1) {
      result.append('<img class="avatarImg img-rounded" ' +
                    'width="40" height="40" src="' +
                    members[i].avatar + '" alt="Avatar for @' + members[i].user + '"/>');
    }
    return result;
  }

  function renderMembers(members)
  {
    var result = $('<p/>');
    if (members.length > 0) {
      result.append(members[0].user);
      for (var i = 1; i < members.length; i += 1) {
        result.append(', ' + members[i].user);
      }
    }
    return result;
  }

  function findChannelMembers(channel, channelMembers)
  {
    var isPatter = (channel.type === 'net.patter-app.room');
    var members = [];
    if (channel.owner)/* &&
        (channel.owner.id !== currentUser.id || isPatter))*/
    {
      members.push({ user: channel.owner.username,
                     avatar: channel.owner.avatar_image.url });
    }
    for (var i = 0; i < channel.writers.user_ids.length; i += 1)
    {
      var id = channel.writers.user_ids[i];
      if (channelMembers[id])/* &&
          (id !== currentUser.id || isPatter))*/
      {
        members.push({user: channelMembers[id].username,
                      avatar: channelMembers[id].avatar_image.url});
      }
    }
    members.sort(function (left, right) {
      return left.user.localeCompare(right.user);
    });
    return members;
  }

  return RoomListView;
});
