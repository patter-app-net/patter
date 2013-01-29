// base.js
//
// Utility functions for dealing with app.net

/*global define:true */
define(['jquery', 'js/util', 'js/appnet-api', 'js/appnet-note'],
function ($, util, api, note) {
  'use strict';

  var appnet = {
    api: api,
    note: note,
    user: null
  };

  appnet.init = function (tokenCookie, urlCookie)
  {
    this.api.init(tokenCookie, urlCookie);
  };

  appnet.isLogged = function () {
    return this.api.accessToken !== null;
  };

  var updateUserSuccess = function (response) {
    appnet.user = response.data;
    if (this.success)
    {
      this.success(response);
    }
  };

  var updateUserFailure = function (meta)
  {
    if (this.failure)
    {
      this.failure(meta);
    }
  };

  appnet.updateUser = function (success, failure)
  {
    var complete = {
      success: success,
      failure: failure
    };
    api.getUser('me', { 'include_annotations': 1 },
                   $.proxy(updateUserSuccess, complete),
                   $.proxy(updateUserFailure, complete));
  };


  appnet.textToHtml = function (text, entitiesIn)
  {
    var result = $('<div/>');
    var entities = sortEntities(entitiesIn);
    var anchor = 0;
    var entity, link;
    var i = 0;
    for (i = 0; i < entities.length; i += 1) {
      entity = entities[i].entity;
      result.append(util.htmlEncode(text.substr(anchor, entity.pos - anchor)));
      link = $('<a target="_blank"/>');
      if (entities[i].type === 'mentions')
      {
        link.addClass('mention');
        link.attr('href',
                  'http://alpha.app.net/' + util.htmlEncode(entity.name));
        link.append(util.htmlEncode('@' + entity.name));
      }
      else if (entities[i].type === 'hashtags')
      {
        link.addClass('hashtag');
        link.attr('href',
                  'http://alpha.app.net/hashtags/' +
                  util.htmlEncode(entity.name));
        link.append(util.htmlEncode('#' + entity.name));
      }
      else if (entities[i].type === 'links')
      {
        link.addClass('link');
        link.attr('href', entity.url);
        link.append(util.htmlEncode(entity.text));
      }
      result.append(link);
      anchor = entity.pos + entity.len;
    }
    result.append(util.htmlEncode(text.substr(anchor)));
    return result;
  };

  function sortEntities(entities)
  {
    var result = [];
    var typeList = ['mentions', 'hashtags', 'links'];
    var i = 0;
    var j = 0;
    for (i = 0; i < typeList.length; i += 1)
    {
      var type = typeList[i];
      for (j = 0; j < entities[type].length; j += 1)
      {
        result.push({pos: entities[type][j].pos,
                     type: type,
                     entity: entities[type][j]});
      }
    }
    result.sort(function (left, right) {
      return left.pos - right.pos;
    });
    return result;
  }

  appnet.renderStatus = function (channel)
  {
    var locked = (channel.readers.immutable && channel.writers.immutable);
    var lockStatus = '';
    if (locked) {
      lockStatus = '<i class="icon-lock"></i> ';
    }
    var status = '<span class="label">' + lockStatus + 'Private</span>';
    if (channel.readers['public'] || channel.readers.any_user) {
      status = '<span class="label label-success">' + lockStatus +
        'Public Read</span>';
    }
    if (channel.writers['public'] || channel.writers.any_user) {
      status = '<span class="label label-success">' + lockStatus +
        'Public</span>';
    }
    return status;
  };

  return appnet;
});
