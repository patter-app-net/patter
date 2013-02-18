// appnet-api.js
//
// API calls on the app.net web service

/*global define: true */
define(['jquery', 'util', 'jquery-cookie'],
function ($, util) {
  'use strict';

  var api = {
    accessToken: null
  };

  var authCookie = 'appnetToken';
  var urlCookie = 'appnetPrevUrl';

  api.init = function (newAuthCookie, newUrlCookie)
  {
    authCookie = newAuthCookie;
    urlCookie = newUrlCookie;

    api.accessToken = $.cookie(authCookie);
    if (api.accessToken)
    {
      $.removeCookie(authCookie, { path: '/' });
      localStorage[authCookie] = api.accessToken;
    }
    else
    {
      api.accessToken = localStorage[authCookie];
    }
  };

  var callSuccess = function (response)
  {
    if (response !== null &&
	response.meta !== undefined &&
	response.data !== undefined)
    {
      if (this.success)
      {
        this.success(response);
      }
    }
    else
    {
      if (this.failure)
      {
        console.log('AppNet null response');
        console.dir(response);
        this.failure(response.meta);
      }
    }
  };

  var callFailure = function (request, status, thrown)
  {
    console.log('AppNet call failed: ' + status + ', thrown: ' + thrown);
    console.dir(request.responseText);
    var meta = null;
    if (request.responseText) {
      var response = JSON.parse(request.responseText);
      if (response !== null) {
        meta = response.meta;
      }
    }
    if (this.failure) {
      this.failure(meta);
    }
  };

  function makeArgs(args)
  {
    var result = '';
    if (args)
    {
      result = $.param(args);
    }
    if (result !== '')
    {
      result = '?' + result;
    }
    return result;
  }
    
  function makeData(data)
  {
    var result = null;
    if (data)
    {
      result = JSON.stringify(data);
    }
    return result;
  }
  
  function makeUrl(pieces)
  {
    var result = '';
    var i = 0;
    for (i = 0; i < pieces.length; i += 1)
    {
      if (pieces[i])
      {
        result += pieces[i];
      }
    }
    return result;
  }

  function add(name, type, url)
  {
    api[name] = function (args, success, failure) {
      this.call(url, type, args, success, failure);
    };
  }

  function addOne(name, type, prefix, suffix)
  {
    api[name] = function (target, args, success, failure) {
      var url = makeUrl([prefix, target, suffix]);
      this.call(url, type, args, success, failure);
    };
  }
    
  function addTwo(name, type, prefix, middle, suffix)
  {
    api[name] = function (first, second, args, success, failure) {
      var url = makeUrl([prefix, first, middle, second, suffix]);
      this.call(url, type, args, success, failure);
    };
  }

  function addList(name, type, url)
  {
    api[name] = function (list, argsIn, success, failure) {
      var ids = list.join(',');
      var args = { ids: ids};
      $.extend(args, argsIn);
      this.call(url, type, args, success, failure);
    };
  }

  function addData(name, type, url)
  {
    api[name] = function (data, args, success, failure) {
      this.call(url, type, args, success, failure, data);
    };
  }

  function addDataOne(name, type, prefix, suffix)
  {
    api[name] = function (target, data, args, success, failure) {
      var url = makeUrl([prefix, target, suffix]);
      this.call(url, type, args, success, failure, data);
    };
  }

  function allFromSingle(single)
  {
    return function (args, success, failure)
    {
      if (! args)
      {
        args = {};
      }
      args.count = 200;
      var result = [];

      function fetchMore(response)
      {
        result = result.concat(response.data);
        if (response.meta.more)
        {
          args.before_id = response.meta.min_id;
          single(args, fetchMore, failure);
        }
        else
        {
          success({ data: result });
        }
      }

      single(args, fetchMore, failure);
    };
  }

  function addAll(name, single)
  {
    api[name] = allFromSingle(single);
  }

  function addAllOne(name, single)
  {
    api[name] = function (target, args, success, failure)
    {
      var callWithTarget = function (a, b, c) {
        return single(target, a, b, c);
      };
      allFromSingle(callWithTarget)(args, success, failure);
    };
  }

  function addAllList(name, single)
  {
    api[name] = function (list, args, success, failure)
    {
      var start = 0;
      var end = (list.length < 200 ? list.length : 200);
      var result = [];

      function fetchMore(response)
      {
        result = result.concat(response.data);
        start += 200;
        end = (list.length < start + 200 ? list.length : 200);
        if (start < list.length)
        {
          single(list.slice(start, end), args, fetchMore, failure);
        }
        else
        {
          success({ data: result });
        }
      }

      single(list.slice(start, end), args, fetchMore, failure);
    };
  }

  // ------------------------------------------------------------------------
  // User
  // ------------------------------------------------------------------------

  // getUser(userId, args, success, failure);
  addOne('getUser', 'GET',
         'https://alpha-api.app.net/stream/0/users/');

  // getUserList([userId1, userId2], args, success, failure);
  addList('getUserList', 'GET',
          'https://alpha-api.app.net/stream/0/users');

  // getAllUserList([userId1, userId2], args, success, failure);
  addAllList('getAllUserList', $.proxy(api.getUserList, api));

  // updateUser(newUserObject, args, success, failure);
  addData('updateUser', 'PUT',
          'https://alpha-api.app.net/stream/0/users/me');

  addOne('getFollowers', 'GET',
         'https://alpha-api.app.net/stream/0/users/', '/followers');

  addOne('getFollowing', 'GET',
         'https://alpha-api.app.net/stream/0/users/', '/following');

  api.setUserAnnotations = function (notes, success, failure)
  {
    var context = {
      notes: notes,
      success: success,
      failure: failure
    };
    api.getUser('me', null, $.proxy(completeUserAnnotation, context), failure);
  };

  var completeUserAnnotation = function (response)
  {
    var user = response.data;
    var locale = user.locale;
    if (locale === 'en_US')
    {
      locale = 'en';
    }
    var newUser = {
      name: user.name,
      locale: locale,
      timezone: user.timezone,
      description: {
        text: user.description.text,
        entities: {
          links: user.description.entities.links
        }
      },
      annotations: this.notes
    };
    api.updateUser(newUser, { include_annotations: 1 },
                   this.success, this.failure);
  };

  // ------------------------------------------------------------------------
  // Channel
  // ------------------------------------------------------------------------

  // createChannel
  addData('createChannel', 'POST',
          'https://alpha-api.app.net/stream/0/channels');

  // getChannel(channelId, args, success, failure);
  addOne('getChannel', 'GET',
         'https://alpha-api.app.net/stream/0/channels/');

  // getChannelList([channelId1, channelId2], args, success, failure);
  addList('getChannelList', 'GET',
          'https://alpha-api.app.net/stream/0/channels/');

  // getAllChannelList([channelId1, channelId2], args, success, failure);
  addAllList('getAllChannelList', $.proxy(api.getChannelList, api));

  // updateChannel(channelId, newChannel, args, success, failure);
  addDataOne('updateChannel', 'PUT',
             'https://alpha-api.app.net/stream/0/channels/');

  api.createSharedFeed = function (name, success, failure)
  {
    var channel = {
      type: 'net.share-app.feed',
      annotations: [{
        type: 'net.share-app.feed',
        value: {
          name: name
        }
      }],
      readers: { 'public': true },
      writers: { any_user: true },
      auto_subscribe: true
    };
    api.createChannel(channel, { include_annotations: 1 }, success, failure);
  };

  api.createShareStorage = function (success, failure)
  {
    var channel = {
      type: 'net.share-app.storage',
      auto_subscribe: true
    };
    api.createChannel(channel, { include_annotations: 1 }, success, failure);
  };

  // ------------------------------------------------------------------------
  // Message
  // ------------------------------------------------------------------------

  // getMessages(channelId, args, success, failure);
  addOne('getMessages', 'GET',
         'https://alpha-api.app.net/stream/0/channels/', '/messages');

  // getAllMessages(channelId, args, success, failure);
  addAllOne('getAllMessages', $.proxy(api.getMessages, api));

  // createMessage(channelId, newMessage, args, success, failure);
  addDataOne('createMessage', 'POST',
             'https://alpha-api.app.net/stream/0/channels/', '/messages');

  // deleteMessage(channelId, messageId, args, success, failure);
  addTwo('deleteMessage', 'DELETE',
         'https://alpha-api.app.net/stream/0/channels/', '/messages/');

  api.shareItem = function (channelId, comment, link, title, content,
                            success, failure)
  {
    var message = {
      text: comment,
      annotations: [{
        type: 'net.share-app.item',
        value: { link: link }
      }, {
        type: 'net.app.core.oembed',
        value: {
          type: 'rich',
          version: '1.0',
          title: title,
          html: content,
          width: '600',
          height: '600',
          embeddable_url: link
        }
      }]
    };
    api.createMessage(channelId, message, { include_annotations: 1 },
                      success, failure);
  };

  api.storeSubscription = function (channelId, url, title, success, failure)
  {
    var message = {
      text: 'Subscribed to Feed URL: ' + url,
      annotations: [{
        type: 'net.share-app.subscription',
        value: {
          link: url,
          title: title
        }
      }]
    };
    api.createMessage(channelId, message, { include_annotations: 1 },
                      success, failure);
  };

  // ------------------------------------------------------------------------
  // Post
  // ------------------------------------------------------------------------

  // createPost(newPost, args, success, failure);
  addData('createPost', 'POST',
          'https://alpha-api.app.net/stream/0/posts');

  // ------------------------------------------------------------------------
  // Subscription
  // ------------------------------------------------------------------------

  // getSubscriptions(args, success, failure);
  add('getSubscriptions', 'GET',
      'https://alpha-api.app.net/stream/0/channels/');

  // getAllSubscriptions(args, success, failure);
  addAll('getAllSubscriptions', $.proxy(api.getSubscriptions, api));

  // createSubscription(channelId, args, success, failure);
  addOne('createSubscription', 'POST',
         'https://alpha-api.app.net/stream/0/channels/', '/subscribe');

  // deleteSubscription(channelId, args, success, failure);
  addOne('deleteSubscription', 'DELETE',
         'https://alpha-api.app.net/stream/0/channels/', '/subscribe');

  // ------------------------------------------------------------------------
  // Files
  // ------------------------------------------------------------------------

  // createFile(file, args, success, failure);
  addData('createFile', 'POST',
          'https://alpha-api.app.net/stream/0/files');


  // completeFile(fileId, data, args, success, failure);
  addDataOne('completeFile', 'PUT',
             'https://alpha-api.app.net/stream/0/files/', '/content');

  // ------------------------------------------------------------------------
  // Other
  // ------------------------------------------------------------------------

  // updateMarker(newMarker, args, success, failure);
  addData('updateMarker', 'POST',
          'https://alpha-api.app.net/stream/0/posts/marker');

  addData('processText', 'POST',
          'https://alpha-api.app.net/stream/0/text/process');

  api.authorize = function ()
  {
    $.cookie(urlCookie, window.location, { expires: 1, path: '/' });
    util.redirect('auth.html');
  };
  
  api.call = function (url, type, args, success, failure, data)
  {
    var complete = {
      success: success,
      failure: failure
    };
    var options = {
      contentType: 'application/json',
      dataType: 'json',
      type: type,
      url: url + makeArgs(args)
    };
    if (this.accessToken) {
      options.headers = { Authorization: 'Bearer ' + this.accessToken };
    }
    if (data) {
      options.data = makeData(data);
    }
    var header = $.ajax(options);
    header.done($.proxy(callSuccess, complete));
    header.fail($.proxy(callFailure, complete));
  };
  
  return api;
});
