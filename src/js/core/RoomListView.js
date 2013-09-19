// RoomListView.js
//
// A backbone view for an embedded list of room information

/*global define:true */
define(['jquery', 'underscore', 'backbone', 'util',
        'js/core/RoomItemView',
        'js/deps/text!template/RoomListView.html',
        'jquery-appnet'],
function ($, _, Backbone, util, RoomItemView, listTemplateString,
          pmTemplateString, roomTemplateString)
{
  'use strict';

  var listTemplate = _.template(listTemplateString);

  var RoomListView = Backbone.View.extend({

    tagName: 'div',

    className: 'room-list',

    events: {
      'click #more': 'clickMore',
      'click #update': 'clickUpdate'
    },

    initialize: function () {
      this.options.viewMap = {};
      this.options.roomMap = {};

      this.$el.html(listTemplate({ noneText: this.options.noneText }));
      this.listenTo(this.model, 'reset', this.render);
      this.listenTo(this.model, 'fetchBegin', this.fetchBegin);
      this.listenTo(this.model, 'fetchSuccess', this.fetchSuccess);
      this.listenTo(this.model, 'fetchFail', this.fetchFail);
      this.listenTo(this.model, 'update', this.renderUpdate);
      this.listenTo(this.model, 'updateComplete', this.render);
    },

    render: function () {
      this.clearViews();
      this.options.roomMap = {};
      this.$('#head').html(util.htmlEncode(this.model.get('title')));
      this.renderUpdate();
      this.$('#body-loading').hide();
      this.$('#body').html('');
      this.renderRooms(this.model.get('rooms'));
      this.renderTab();
      this.model.trigger('renderComplete');
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
      this.$('#body-loading').show();
      this.$('#more').button('loading');
      this.$('#none-found').hide();
    },

    fetchSuccess: function (newRooms) {
      this.$('#body-loading').hide();
      this.$('#more').button('reset');
      this.renderRooms(newRooms);
      this.renderTab();
    },

    fetchFail: function () {
      this.$('#body-loading').hide();
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
      var body = this.$('#body');
      for (i = 0; i < rooms.length; i += 1)
      {
        this.options.roomMap[rooms[i].get('channel').id] = rooms[i];
        var current = this.findView(rooms[i]);
        if (current.render())
        {
          body.append(current.$el);
          hasShown = true;
        }
      }
      this.pruneViews();
      if (! hasShown && this.model.get('updates').length === 0)
      {
        this.$('#none-found').show();
      }
      else
      {
        this.$('#none-found').hide();
      }
      if (this.model.get('hasMore') && this.options.showMore)
      {
        this.$('#more').show();
      }
      else
      {
        this.$('#more').hide();
      }
      util.formatTimestamp(this.$('.timestamp'));
    },

    findView: function (room) {
      var result;
      var id = room.get('channel').id;
      if (this.options.viewMap[id])
      {
        result = this.options.viewMap[id];
      }
      else
      {
        result = new RoomItemView({
          model: room,
          showUnreadState: this.options.showUnreadState,
          showWhenMuted: this.options.showWhenMuted,
          showWhenUnsubscribed: this.options.showWhenUnsubscribed,
          hideWhenRead: this.options.hideWhenRead
        });
        this.options.viewMap[id] = result;
      }
      return result;
    },

    pruneViews: function () {
      for (var key in this.optionsviewMap)
      {
        if (this.options.viewMap.hasOwnProperty(key))
        {
          var id = this.options.viewMap[key].model.get('channel').id;
          if (! this.options.roomMap[id])
          {
            this.options.viewMap[key].remove();
            delete this.options.viewMap[key];
          }
        }
      }
    },

    cleanup: function () {
      this.clearViews();
      this.remove();
    },

    clearViews: function () {
      for (var key in this.options.viewMap)
      {
        if (this.options.viewMap.hasOwnProperty(key))
        {
          this.options.viewMap[key].remove();
        }
      }
      this.options.viewMap = {};
    }

  });

  return RoomListView;
});
