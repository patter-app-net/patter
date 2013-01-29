// appnet-api.js
//
// API calls on the app.net web service

/*global define: true */
define(['jquery', 'js/util', 'jquery-cookie'],
function ($, util) {
  'use strict';

  var appnet = {
    accessToken: null
  };

  var authCookie = 'appnetToken';
  var urlCookie = 'appnetPrevUrl';

  appnet.init = function (newAuthCookie, newUrlCookie)
  {
    authCookie = newAuthCookie;
    urlCookie = newUrlCookie;

    appnet.accessToken = $.cookie(authCookie);
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
    appnet[name] = function (args, success, failure) {
      this.call(url, type, args, success, failure);
    };
  }

  function addOne(name, type, prefix, suffix)
  {
    appnet[name] = function (target, args, success, failure) {
      var url = makeUrl([prefix, target, suffix]);
      this.call(url, type, args, success, failure);
    };
  }
    
  function addTwo(name, type, prefix, middle, suffix)
  {
    appnet[name] = function (first, second, args, success, failure) {
      var url = makeUrl([prefix, first, middle, second, suffix]);
      this.call(url, type, args, success, failure);
    };
  }

  function addList(name, type, url)
  {
    appnet[name] = function (list, argsIn, success, failure) {
      var ids = list.join(',');
      var args = { ids: ids};
      $.extend(args, argsIn);
      this.call(url, type, args, success, failure);
    };
  }

  function addData(name, type, url)
  {
    appnet[name] = function (data, args, success, failure) {
      this.call(url, type, args, success, failure, data);
    };
  }

  function addDataOne(name, type, prefix, suffix)
  {
    appnet[name] = function (target, data, args, success, failure) {
      var url = makeUrl([prefix, target, suffix]);
      this.call(url, type, args, success, failure, data);
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

  // updateUser(newUser, args, success, failure);
  addData('updateUser', 'PUT',
          'https://alpha-api.app.net/stream/0/users/me');

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

  // updateChannel(channelId, newChannel, args, success, failure);
  addDataOne('updateChannel', 'PUT',
             'https://alpha-api.app.net/stream/0/channels/');

  // ------------------------------------------------------------------------
  // Message
  // ------------------------------------------------------------------------

  // getMessages(channelId, args, success, failure);
  addOne('getMessages', 'GET',
         'https://alpha-api.app.net/stream/0/channels/', '/messages');

  // createMessage(channelId, newMessage, args, success, failure);
  addDataOne('createMessage', 'POST',
             'https://alpha-api.app.net/stream/0/channels/', '/messages');

  // deleteMessage(messageId, args, success, failure);
  addTwo('deleteMessage', 'DELETE',
         'https://alpha-api.app.net/stream/0/channels/', '/messages/');

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

  // createSubscription(channelId, args, success, failure);
  addOne('createSubscription', 'POST',
         'https://alpha-api.app.net/stream/0/channels/', '/subscribe');

  // deleteSubscription(channelId, args, success, failure);
  addOne('deleteSubscription', 'DELETE',
         'https://alpha-api.app.net/stream/0/channels/', '/subscribe');

  // ------------------------------------------------------------------------
  // Marker
  // ------------------------------------------------------------------------

  // updateMarker(newMarker, args, success, failure);
  addData('updateMarker', 'POST',
          'https://alpha-api.app.net/stream/0/posts/marker');

  appnet.authorize = function ()
  {
    $.cookie(urlCookie, window.location, { expires: 1, path: '/' });
    util.redirect('auth.html');
  };
  
  appnet.call = function (url, type, args, success, failure, data)
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
    if (this.accessToken !== null) {
      options.headers = { Authorization: 'Bearer ' + this.accessToken };
    }
    if (data) {
      options.data = makeData(data);
    }
    var header = $.ajax(options);
    header.done($.proxy(callSuccess, complete));
    header.fail($.proxy(callFailure, complete));
  };
  
  return appnet;
});
