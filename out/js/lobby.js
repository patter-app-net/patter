
eval("// util.js\r\n//\r\n// General utility functions of use to any JavaScript project\r\n\r\n/*global define:true */\r\ndefine(\'util\',[\'jquery\'], function ($) {\r\n  \'use strict\';\r\n\r\n  var util = {};\r\n\r\n  util.redirect = function (dest)\r\n  {\r\n    window.location = dest;\r\n  };\r\n\r\n  util.getUrlVars = function ()\r\n  {\r\n    var vars = [], hash;\r\n    var hashes = window.location.href.slice(window.location.href.indexOf(\'?\') + 1).split(\'&\');\r\n    var i = 0;\r\n    for (i = 0; i < hashes.length; i += 1)\r\n    {\r\n      hash = hashes[i].split(\'=\');\r\n      vars.push(hash[0]);\r\n      vars[hash[0]] = hash[1];\r\n    }\r\n    return vars;\r\n  };\r\n\r\n  util.htmlEncode = function (value)\r\n  {\r\n    var result = \'\';\r\n    if (value) {\r\n      result = $(\'<div />\').text(value).html();\r\n    }\r\n    return result;\r\n  };\r\n\r\n  util.htmlDecode = function (value)\r\n  {\r\n    var result = \'\';\r\n    if (value) {\r\n      result = $(\'<div />\').html(value).text();\r\n    }\r\n    return result;\r\n  };\r\n\r\n\r\n  util.stripSpaces = function (str)\r\n  {\r\n    return str.replace(/ +$/g, \'\').replace(/^ +/g, \'\');\r\n  };\r\n\r\n  util.flagError = function (id, message)\r\n  {\r\n    var newAlert = \'<div class=\"alert alert-error\">\' +\r\n          \'<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\' +\r\n          \'<strong>Error:</strong> \' + message +\r\n          \'</div>\';\r\n    $(\'#\' + id).html(newAlert);\r\n  };\r\n\r\n  util.has_focus = true;\r\n  $(window).on(\'focus\', function () {\r\n    util.has_focus = true;\r\n  });\r\n  $(window).on(\'blur\', function () {\r\n    util.has_focus = false;\r\n  });\r\n\r\n  return util;\r\n});\r\n\n//@ sourceURL=/js/util.js");

/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, parts; (parts = cookies[i] && cookies[i].split('=')); i++) {
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? JSON.parse(cookie) : cookie;
			}
		}

		return null;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);

define("jquery-cookie", function(){});

eval("// appnet-api.js\r\n//\r\n// API calls on the app.net web service\r\n\r\n/*global define: true */\r\ndefine(\'appnet-api\',[\'jquery\', \'util\', \'jquery-cookie\'],\r\nfunction ($, util) {\r\n  \'use strict\';\r\n\r\n  var api = {\r\n    accessToken: null\r\n  };\r\n\r\n  var authCookie = \'appnetToken\';\r\n  var urlCookie = \'appnetPrevUrl\';\r\n\r\n  api.init = function (newAuthCookie, newUrlCookie)\r\n  {\r\n    authCookie = newAuthCookie;\r\n    urlCookie = newUrlCookie;\r\n\r\n    api.accessToken = $.cookie(authCookie);\r\n    if (api.accessToken)\r\n    {\r\n      $.removeCookie(authCookie, { path: \'/\' });\r\n      localStorage[authCookie] = api.accessToken;\r\n    }\r\n    else\r\n    {\r\n      api.accessToken = localStorage[authCookie];\r\n    }\r\n  };\r\n\r\n  var callSuccess = function (response)\r\n  {\r\n    if (response !== null &&\r\n\tresponse.meta !== undefined &&\r\n\tresponse.data !== undefined)\r\n    {\r\n      if (this.success)\r\n      {\r\n        this.success(response);\r\n      }\r\n    }\r\n    else\r\n    {\r\n      if (this.failure)\r\n      {\r\n        console.log(\'AppNet null response\');\r\n        console.dir(response);\r\n        this.failure(response.meta);\r\n      }\r\n    }\r\n  };\r\n\r\n  var callFailure = function (request, status, thrown)\r\n  {\r\n    console.log(\'AppNet call failed: \' + status + \', thrown: \' + thrown);\r\n    console.dir(request.responseText);\r\n    var meta = null;\r\n    if (request.responseText) {\r\n      var response = JSON.parse(request.responseText);\r\n      if (response !== null) {\r\n        meta = response.meta;\r\n      }\r\n    }\r\n    if (this.failure) {\r\n      this.failure(meta);\r\n    }\r\n  };\r\n\r\n  function makeArgs(args)\r\n  {\r\n    var result = \'\';\r\n    if (args)\r\n    {\r\n      result = $.param(args);\r\n    }\r\n    if (result !== \'\')\r\n    {\r\n      result = \'?\' + result;\r\n    }\r\n    return result;\r\n  }\r\n    \r\n  function makeData(data)\r\n  {\r\n    var result = null;\r\n    if (data)\r\n    {\r\n      result = JSON.stringify(data);\r\n    }\r\n    return result;\r\n  }\r\n  \r\n  function makeUrl(pieces)\r\n  {\r\n    var result = \'\';\r\n    var i = 0;\r\n    for (i = 0; i < pieces.length; i += 1)\r\n    {\r\n      if (pieces[i])\r\n      {\r\n        result += pieces[i];\r\n      }\r\n    }\r\n    return result;\r\n  }\r\n\r\n  function add(name, type, url)\r\n  {\r\n    api[name] = function (args, success, failure) {\r\n      this.call(url, type, args, success, failure);\r\n    };\r\n  }\r\n\r\n  function addOne(name, type, prefix, suffix)\r\n  {\r\n    api[name] = function (target, args, success, failure) {\r\n      var url = makeUrl([prefix, target, suffix]);\r\n      this.call(url, type, args, success, failure);\r\n    };\r\n  }\r\n    \r\n  function addTwo(name, type, prefix, middle, suffix)\r\n  {\r\n    api[name] = function (first, second, args, success, failure) {\r\n      var url = makeUrl([prefix, first, middle, second, suffix]);\r\n      this.call(url, type, args, success, failure);\r\n    };\r\n  }\r\n\r\n  function addList(name, type, url)\r\n  {\r\n    api[name] = function (list, argsIn, success, failure) {\r\n      var ids = list.join(\',\');\r\n      var args = { ids: ids};\r\n      $.extend(args, argsIn);\r\n      this.call(url, type, args, success, failure);\r\n    };\r\n  }\r\n\r\n  function addData(name, type, url)\r\n  {\r\n    api[name] = function (data, args, success, failure) {\r\n      this.call(url, type, args, success, failure, data);\r\n    };\r\n  }\r\n\r\n  function addDataOne(name, type, prefix, suffix)\r\n  {\r\n    api[name] = function (target, data, args, success, failure) {\r\n      var url = makeUrl([prefix, target, suffix]);\r\n      this.call(url, type, args, success, failure, data);\r\n    };\r\n  }\r\n\r\n  function allFromSingle(single)\r\n  {\r\n    return function (args, success, failure)\r\n    {\r\n      if (! args)\r\n      {\r\n        args = {};\r\n      }\r\n      args.count = 200;\r\n      var result = [];\r\n\r\n      function fetchMore(response)\r\n      {\r\n        result = result.concat(response.data);\r\n        if (response.meta.more)\r\n        {\r\n          args.before_id = response.meta.min_id;\r\n          single(args, fetchMore, failure);\r\n        }\r\n        else\r\n        {\r\n          success({ data: result });\r\n        }\r\n      }\r\n\r\n      single(args, fetchMore, failure);\r\n    };\r\n  }\r\n\r\n  function addAll(name, single)\r\n  {\r\n    api[name] = allFromSingle(single);\r\n  }\r\n\r\n  function addAllOne(name, single)\r\n  {\r\n    api[name] = function (target, args, success, failure)\r\n    {\r\n      var callWithTarget = function (a, b, c) {\r\n        return single(target, a, b, c);\r\n      };\r\n      allFromSingle(callWithTarget)(args, success, failure);\r\n    };\r\n  }\r\n\r\n  function addAllList(name, single)\r\n  {\r\n    api[name] = function (list, args, success, failure)\r\n    {\r\n      var start = 0;\r\n      var end = (list.length < 200 ? list.length : 200);\r\n      var result = [];\r\n\r\n      function fetchMore(response)\r\n      {\r\n        result = result.concat(response.data);\r\n        start += 200;\r\n        end = (list.length < start + 200 ? list.length : 200);\r\n        if (start < list.length)\r\n        {\r\n          single(list.slice(start, end), args, fetchMore, failure);\r\n        }\r\n        else\r\n        {\r\n          success({ data: result });\r\n        }\r\n      }\r\n\r\n      single(list.slice(start, end), args, fetchMore, failure);\r\n    };\r\n  }\r\n\r\n  // ------------------------------------------------------------------------\r\n  // User\r\n  // ------------------------------------------------------------------------\r\n\r\n  // getUser(userId, args, success, failure);\r\n  addOne(\'getUser\', \'GET\',\r\n         \'https://alpha-api.app.net/stream/0/users/\');\r\n\r\n  // getUserList([userId1, userId2], args, success, failure);\r\n  addList(\'getUserList\', \'GET\',\r\n          \'https://alpha-api.app.net/stream/0/users\');\r\n\r\n  // getAllUserList([userId1, userId2], args, success, failure);\r\n  addAllList(\'getAllUserList\', $.proxy(api.getUserList, api));\r\n\r\n  // updateUser(newUserObject, args, success, failure);\r\n  addData(\'updateUser\', \'PUT\',\r\n          \'https://alpha-api.app.net/stream/0/users/me\');\r\n\r\n  addOne(\'getFollowers\', \'GET\',\r\n         \'https://alpha-api.app.net/stream/0/users/\', \'/followers\');\r\n\r\n  addOne(\'getFollowing\', \'GET\',\r\n         \'https://alpha-api.app.net/stream/0/users/\', \'/following\');\r\n\r\n  api.setUserAnnotations = function (notes, success, failure)\r\n  {\r\n    var context = {\r\n      notes: notes,\r\n      success: success,\r\n      failure: failure\r\n    };\r\n    api.getUser(\'me\', null, $.proxy(completeUserAnnotation, context), failure);\r\n  };\r\n\r\n  var completeUserAnnotation = function (response)\r\n  {\r\n    var user = response.data;\r\n    var locale = user.locale;\r\n    if (locale === \'en_US\')\r\n    {\r\n      locale = \'en\';\r\n    }\r\n    var newUser = {\r\n      name: user.name,\r\n      locale: locale,\r\n      timezone: user.timezone,\r\n      description: {\r\n        text: user.description.text,\r\n        entities: {\r\n          links: user.description.entities.links\r\n        }\r\n      },\r\n      annotations: this.notes\r\n    };\r\n    api.updateUser(newUser, { include_annotations: 1 },\r\n                   this.success, this.failure);\r\n  };\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Channel\r\n  // ------------------------------------------------------------------------\r\n\r\n  // createChannel\r\n  addData(\'createChannel\', \'POST\',\r\n          \'https://alpha-api.app.net/stream/0/channels\');\r\n\r\n  // getChannel(channelId, args, success, failure);\r\n  addOne(\'getChannel\', \'GET\',\r\n         \'https://alpha-api.app.net/stream/0/channels/\');\r\n\r\n  // getChannelList([channelId1, channelId2], args, success, failure);\r\n  addList(\'getChannelList\', \'GET\',\r\n          \'https://alpha-api.app.net/stream/0/channels/\');\r\n\r\n  // getAllChannelList([channelId1, channelId2], args, success, failure);\r\n  addAllList(\'getAllChannelList\', $.proxy(api.getChannelList, api));\r\n\r\n  // updateChannel(channelId, newChannel, args, success, failure);\r\n  addDataOne(\'updateChannel\', \'PUT\',\r\n             \'https://alpha-api.app.net/stream/0/channels/\');\r\n\r\n  api.createSharedFeed = function (name, success, failure)\r\n  {\r\n    var channel = {\r\n      type: \'net.share-app.feed\',\r\n      annotations: [{\r\n        type: \'net.share-app.feed\',\r\n        value: {\r\n          name: name\r\n        }\r\n      }],\r\n      readers: { \'public\': true },\r\n      writers: { any_user: true },\r\n      auto_subscribe: true\r\n    };\r\n    api.createChannel(channel, { include_annotations: 1 }, success, failure);\r\n  };\r\n\r\n  api.createShareStorage = function (success, failure)\r\n  {\r\n    var channel = {\r\n      type: \'net.share-app.storage\',\r\n      auto_subscribe: true\r\n    };\r\n    api.createChannel(channel, { include_annotations: 1 }, success, failure);\r\n  };\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Message\r\n  // ------------------------------------------------------------------------\r\n\r\n  // getMessages(channelId, args, success, failure);\r\n  addOne(\'getMessages\', \'GET\',\r\n         \'https://alpha-api.app.net/stream/0/channels/\', \'/messages\');\r\n\r\n  // getAllMessages(channelId, args, success, failure);\r\n  addAllOne(\'getAllMessages\', $.proxy(api.getMessages, api));\r\n\r\n  // createMessage(channelId, newMessage, args, success, failure);\r\n  addDataOne(\'createMessage\', \'POST\',\r\n             \'https://alpha-api.app.net/stream/0/channels/\', \'/messages\');\r\n\r\n  // deleteMessage(channelId, messageId, args, success, failure);\r\n  addTwo(\'deleteMessage\', \'DELETE\',\r\n         \'https://alpha-api.app.net/stream/0/channels/\', \'/messages/\');\r\n\r\n  api.shareItem = function (channelId, comment, link, title, content,\r\n                            success, failure)\r\n  {\r\n    var message = {\r\n      text: comment,\r\n      annotations: [{\r\n        type: \'net.share-app.item\',\r\n        value: { link: link }\r\n      }, {\r\n        type: \'net.app.core.oembed\',\r\n        value: {\r\n          type: \'rich\',\r\n          version: \'1.0\',\r\n          title: title,\r\n          html: content,\r\n          width: \'600\',\r\n          height: \'600\',\r\n          embeddable_url: link\r\n        }\r\n      }]\r\n    };\r\n    api.createMessage(channelId, message, { include_annotations: 1 },\r\n                      success, failure);\r\n  };\r\n\r\n  api.storeSubscription = function (channelId, url, title, success, failure)\r\n  {\r\n    var message = {\r\n      text: \'Subscribed to Feed URL: \' + url,\r\n      annotations: [{\r\n        type: \'net.share-app.subscription\',\r\n        value: {\r\n          link: url,\r\n          title: title\r\n        }\r\n      }]\r\n    };\r\n    api.createMessage(channelId, message, { include_annotations: 1 },\r\n                      success, failure);\r\n  };\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Post\r\n  // ------------------------------------------------------------------------\r\n\r\n  // createPost(newPost, args, success, failure);\r\n  addData(\'createPost\', \'POST\',\r\n          \'https://alpha-api.app.net/stream/0/posts\');\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Subscription\r\n  // ------------------------------------------------------------------------\r\n\r\n  // getSubscriptions(args, success, failure);\r\n  add(\'getSubscriptions\', \'GET\',\r\n      \'https://alpha-api.app.net/stream/0/channels/\');\r\n\r\n  // getAllSubscriptions(args, success, failure);\r\n  addAll(\'getAllSubscriptions\', $.proxy(api.getSubscriptions, api));\r\n\r\n  // createSubscription(channelId, args, success, failure);\r\n  addOne(\'createSubscription\', \'POST\',\r\n         \'https://alpha-api.app.net/stream/0/channels/\', \'/subscribe\');\r\n\r\n  // deleteSubscription(channelId, args, success, failure);\r\n  addOne(\'deleteSubscription\', \'DELETE\',\r\n         \'https://alpha-api.app.net/stream/0/channels/\', \'/subscribe\');\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Files\r\n  // ------------------------------------------------------------------------\r\n\r\n  // createFile(file, args, success, failure);\r\n  addData(\'createFile\', \'POST\',\r\n          \'https://alpha-api.app.net/stream/0/files\');\r\n\r\n\r\n  // completeFile(fileId, data, args, success, failure);\r\n  addDataOne(\'completeFile\', \'PUT\',\r\n             \'https://alpha-api.app.net/stream/0/files/\', \'/content\');\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Other\r\n  // ------------------------------------------------------------------------\r\n\r\n  // updateMarker(newMarker, args, success, failure);\r\n  addData(\'updateMarker\', \'POST\',\r\n          \'https://alpha-api.app.net/stream/0/posts/marker\');\r\n\r\n  addData(\'processText\', \'POST\',\r\n          \'https://alpha-api.app.net/stream/0/text/process\');\r\n\r\n  api.authorize = function ()\r\n  {\r\n    $.cookie(urlCookie, window.location, { expires: 1, path: \'/\' });\r\n    util.redirect(\'auth.html\');\r\n  };\r\n  \r\n  api.call = function (url, type, args, success, failure, data)\r\n  {\r\n    var complete = {\r\n      success: success,\r\n      failure: failure\r\n    };\r\n    var options = {\r\n      contentType: \'application/json\',\r\n      dataType: \'json\',\r\n      type: type,\r\n      url: url + makeArgs(args)\r\n    };\r\n    if (this.accessToken) {\r\n      options.headers = { Authorization: \'Bearer \' + this.accessToken };\r\n    }\r\n    if (data) {\r\n      options.data = makeData(data);\r\n    }\r\n    var header = $.ajax(options);\r\n    header.done($.proxy(callSuccess, complete));\r\n    header.fail($.proxy(callFailure, complete));\r\n  };\r\n  \r\n  return api;\r\n});\r\n\n//@ sourceURL=/js/appnet-api.js");

eval("// appnet-note.js\r\n//\r\n// Functions to create and process app.net annotations\r\n\r\n/*global define: true */\r\ndefine(\'appnet-note\',[\'util\'], function (util) {\r\n  \'use strict\';\r\n\r\n  var note = {};\r\n\r\n  note.findAnnotation = function (type, list)\r\n  {\r\n    var result = null;\r\n    var i = 0;\r\n    if (list)\r\n    {\r\n      for (i = 0; i < list.length; i += 1)\r\n      {\r\n        if (list[i].type === type)\r\n        {\r\n          result = list[i].value;\r\n          break;\r\n        }\r\n      }\r\n    }\r\n    return result;\r\n  };\r\n\r\n  note.findPatterSettings = function (channel)\r\n  {\r\n    var result = null;\r\n    if (channel)\r\n    {\r\n      result = note.findAnnotation(\'net.patter-app.settings\',\r\n                                   channel.annotations);\r\n    }\r\n    if (result === null)\r\n    {\r\n      result = {};\r\n    }\r\n    return result;\r\n  };\r\n\r\n  note.findPatterName = function (channel)\r\n  {\r\n    var name = null;\r\n    var settings = note.findAnnotation(\'net.patter-app.settings\',\r\n                                       channel.annotations);\r\n    if (settings !== null && settings.name !== undefined)\r\n    {\r\n      name = settings.name;\r\n    }\r\n    return name;\r\n  };\r\n\r\n  note.findBlogName = function (channel)\r\n  {\r\n    var name = null;\r\n    var settings = note.findAnnotation(\'net.blog-app.settings\',\r\n                                       channel.annotations);\r\n    if (settings !== null && settings.name !== undefined)\r\n    {\r\n      name = settings.name;\r\n    }\r\n    return name;\r\n  };\r\n\r\n  note.findBlogStatus = function (message)\r\n  {\r\n    return note.findAnnotation(\'net.blog-app.status\',\r\n                               message.annotations);\r\n  };\r\n\r\n  note.findBlogPost = function (message)\r\n  {\r\n    return note.findAnnotation(\'net.jazzychad.adnblog.post\',\r\n                               message.annotations);\r\n  };\r\n\r\n  note.findBlogPhotoset = function (message)\r\n  {\r\n    return note.findAnnotation(\'net.blog-app.photoset\',\r\n                               message.annotations);\r\n  };\r\n\r\n  note.findChannelRefId = function (message)\r\n  {\r\n    var id = null;\r\n    if (message)\r\n    {\r\n      var ref = note.findAnnotation(\'net.view-app.channel-ref\',\r\n                                    message.annotations);\r\n      if (ref && ref.id)\r\n      {\r\n        id = ref.id;\r\n      }\r\n    }\r\n    return id;\r\n  };\r\n\r\n  note.broadcastNote = function (id, url) {\r\n    return {\r\n      type: \'net.patter-app.broadcast\',\r\n      value: {\r\n        id: id,\r\n        url: url\r\n      }\r\n    };\r\n  };\r\n\r\n  note.embedImageNote = function (url, widthIn, heightIn) {\r\n    var width = widthIn;\r\n    if (widthIn === null ||\r\n        widthIn === undefined)\r\n    {\r\n      width = 300;\r\n    }\r\n    var height = heightIn;\r\n    if (heightIn === null ||\r\n        heightIn === undefined)\r\n    {\r\n      height = 300;\r\n    }\r\n    return {\r\n      type: \'net.app.core.oembed\',\r\n      value: {\r\n        version: \'1.0\',\r\n        type: \'photo\',\r\n        width: width,\r\n        height: height,\r\n        url: util.stripSpaces(url)\r\n      }\r\n    };\r\n  };\r\n\r\n  note.channelRefNote = function (id, name, userId, type) {\r\n    return {\r\n      type: \'net.view-app.channel-ref\',\r\n      value: {\r\n        id: id,\r\n        label: name,\r\n        owner_id: userId,\r\n        type: type\r\n      }\r\n    };\r\n  };\r\n\r\n  return note;\r\n});\r\n\n//@ sourceURL=/js/appnet-note.js");

eval("// base.js\r\n//\r\n// Utility functions for dealing with app.net\r\n\r\n/*global define:true */\r\ndefine(\'appnet\',[\'jquery\', \'util\', \'appnet-api\', \'appnet-note\'],\r\nfunction ($, util, api, note) {\r\n  \'use strict\';\r\n\r\n  var appnet = {\r\n    api: api,\r\n    note: note,\r\n    user: null\r\n  };\r\n\r\n  appnet.init = function (tokenCookie, urlCookie)\r\n  {\r\n    this.api.init(tokenCookie, urlCookie);\r\n  };\r\n\r\n  appnet.isLogged = function () {\r\n    return this.api.accessToken !== null && this.api.accessToken !== undefined;\r\n  };\r\n\r\n  var updateUserSuccess = function (response) {\r\n    appnet.user = response.data;\r\n    if (this.success)\r\n    {\r\n      this.success(response);\r\n    }\r\n  };\r\n\r\n  var updateUserFailure = function (meta)\r\n  {\r\n    if (this.failure)\r\n    {\r\n      this.failure(meta);\r\n    }\r\n  };\r\n\r\n  appnet.updateUser = function (success, failure)\r\n  {\r\n    var complete = {\r\n      success: success,\r\n      failure: failure\r\n    };\r\n    api.getUser(\'me\', { \'include_annotations\': 1 },\r\n                   $.proxy(updateUserSuccess, complete),\r\n                   $.proxy(updateUserFailure, complete));\r\n  };\r\n\r\n\r\n  appnet.textToHtml = function (text, entitiesIn)\r\n  {\r\n    var result = $(\'<div/>\');\r\n    var entities = sortEntities(entitiesIn);\r\n    var anchor = 0;\r\n    var entity, link;\r\n    var i = 0;\r\n    for (i = 0; i < entities.length; i += 1) {\r\n      entity = entities[i].entity;\r\n      result.append(util.htmlEncode(text.substr(anchor, entity.pos - anchor)));\r\n      link = $(\'<a target=\"_blank\"/>\');\r\n      if (entities[i].type === \'mentions\')\r\n      {\r\n        link.addClass(\'mention\');\r\n        link.attr(\'href\',\r\n                  \'http://alpha.app.net/\' + util.htmlEncode(entity.name));\r\n        link.append(util.htmlEncode(\'@\' + entity.name));\r\n      }\r\n      else if (entities[i].type === \'hashtags\')\r\n      {\r\n        link.addClass(\'hashtag\');\r\n        link.attr(\'href\',\r\n                  \'http://alpha.app.net/hashtags/\' +\r\n                  util.htmlEncode(entity.name));\r\n        link.append(util.htmlEncode(\'#\' + entity.name));\r\n      }\r\n      else if (entities[i].type === \'links\')\r\n      {\r\n        link.addClass(\'link\');\r\n        link.attr(\'href\', entity.url);\r\n        link.append(util.htmlEncode(entity.text));\r\n      }\r\n      result.append(link);\r\n      anchor = entity.pos + entity.len;\r\n    }\r\n    result.append(util.htmlEncode(text.substr(anchor)));\r\n    return result;\r\n  };\r\n\r\n  function sortEntities(entities)\r\n  {\r\n    var result = [];\r\n    var typeList = [\'mentions\', \'hashtags\', \'links\'];\r\n    var i = 0;\r\n    var j = 0;\r\n    for (i = 0; i < typeList.length; i += 1)\r\n    {\r\n      var type = typeList[i];\r\n      for (j = 0; j < entities[type].length; j += 1)\r\n      {\r\n        result.push({pos: entities[type][j].pos,\r\n                     type: type,\r\n                     entity: entities[type][j]});\r\n      }\r\n    }\r\n    result.sort(function (left, right) {\r\n      return left.pos - right.pos;\r\n    });\r\n    return result;\r\n  }\r\n\r\n  appnet.renderStatus = function (channel)\r\n  {\r\n    var locked = (channel.readers.immutable && channel.writers.immutable);\r\n    var lockStatus = \'\';\r\n    if (locked) {\r\n      lockStatus = \'<i class=\"icon-lock\"></i> \';\r\n    }\r\n    var status = \'<span class=\"label\">\' + lockStatus + \'Private</span>\';\r\n    if (channel.readers[\'public\'] || channel.readers.any_user) {\r\n      status = \'<span class=\"label label-success\">\' + lockStatus +\r\n        \'Public Read</span>\';\r\n    }\r\n    if (channel.writers[\'public\'] || channel.writers.any_user) {\r\n      status = \'<span class=\"label label-success\">\' + lockStatus +\r\n        \'Public</span>\';\r\n    }\r\n    return status;\r\n  };\r\n\r\n  return appnet;\r\n});\r\n\n//@ sourceURL=/js/appnet.js");

eval("// roomInfo.js\n//\n// Information about the current room the user is chatting in.\n\n/*global define:true */\ndefine(\'js/roomInfo\',[\'jquery\', \'util\', \'appnet\'], function ($, util, appnet) {\n  \'use strict\';\n\n  var roomInfo = {\n    id: null,\n    channel: null,\n    members: {},\n    changeCallback: null\n  };\n\n  roomInfo.updateChannel = function ()\n  {\n//    $(\'#loading-message\').html(\"Fetching Channel Information\");\n    appnet.api.getChannel(this.id, {include_annotations: 1},\n                          $.proxy(this.completeChannelInfo, this),\n                          $.proxy(failChannelInfo, this));\n  };\n\n  roomInfo.completeChannelInfo = function (response)\n  {\n    var owner = response.data.owner;\n    var keyList = Object.keys(this.members);\n    var i = 0;\n    this.channel = response.data;\n    var name = appnet.note.findPatterName(this.channel);\n    if (name)\n    {\n      $(\'title\').html(util.htmlEncode(name) + \' (Patter)\');\n    }\n    else\n    {\n      $(\'title\').html(\'Private Message Channel (Patter)\');\n    }\n    for (i = 0; i < keyList.length; i += 1)\n    {\n      delete this.members[keyList[i]];\n    }\n    this.members[owner.username] = owner;\n    getWriterInfo();\n  };\n\n  var failChannelInfo = function (meta)\n  {\n    if (this.changeCallback)\n    {\n      this.changeCallback();\n    }\n  };\n\n  function getWriterInfo()\n  {\n    var ids = roomInfo.channel.writers.user_ids;\n    if (ids)\n    {\n      appnet.api.getUserList(ids, null, completeWriterInfo, failWriterInfo);\n    }\n    else if (roomInfo.changecallback)\n    {\n      roomInfo.changeCallback();\n    }\n  }\n\n  function completeWriterInfo(response)\n  {\n    var i = 0;\n    for (i = 0; i < response.data.length; i += 1)\n    {\n      roomInfo.members[response.data[i].username] = response.data[i];\n    }\n\n    if (roomInfo.changeCallback)\n    {\n      roomInfo.changeCallback();\n    }\n  }\n\n  function failWriterInfo(response)\n  {\n    if (roomInfo.changeCallback)\n    {\n      roomInfo.changeCallback();\n    }\n  }\n\n  return roomInfo;\n});\n\n//@ sourceURL=/js/roomInfo.js");

eval("// UserFields.js\n//\n// Expandable list of input fields which are validated against app.net\n\n/*global define:true */\ndefine(\'js/UserFields\',[\'jquery\', \'util\', \'appnet\'],\nfunction ($, util, appnet) {\n  \'use strict\';\n  function UserFields(prefix)\n  {\n    this.prefix = prefix;\n    this.moreDiv = $(\'#\' + prefix + \'-more-div\');\n    this.fieldCount = 0;\n    this.memberNames = {};\n    this.callback = null;\n    $(\'#\' + prefix + \'-more-button\').click($.proxy(this.clickMore, this));\n  }\n\n  UserFields.prototype.clickMore = function (event)\n  {\n    event.preventDefault();\n    this.addField();\n    return false;\n  };\n\n  // Create a new user name field\n  UserFields.prototype.addField = function (val)\n  {\n    var fieldset = $(\'<fieldset/>\');\n    var newItem = $(\'<div id=\"\' + this.prefix + \'-wrapper-\' +\n                    this.fieldCount +\n                    \'\" class=\"input-append control-group pull-left\"/>\');\n    newItem.append(\'<input id=\"\' + this.prefix + \'-input-\' + this.fieldCount +\n                   \'\" class=\"input\" type=\"text\" placeholder=\"@user\">\');\n    newItem.append(\'<button tabindex=\"-1\" id=\"\' + this.prefix + \'-remove-\' +\n                   this.fieldCount +\n                   \'\" class=\"btn btn-danger\"><i class=\"icon-remove\"></i></button>\');\n    fieldset.append(newItem);\n    this.moreDiv.before(fieldset);\n    if (val) {\n      $(\'#\' + this.prefix + \'-input-\' + this.fieldCount).val(val);\n    }\n    $(\'#\' + this.prefix + \'-remove-\' + this.fieldCount).on(\'click\', null, { index: this.fieldCount, obj: this }, function (event) {\n      event.preventDefault();\n      event.data.obj.removeField(event.data.index);\n      return false;\n    });\n    this.fieldCount += 1;\n  };\n\n  // Remove a new user name field\n  UserFields.prototype.removeField = function (index)\n  {\n    var i = 0;\n    if (index >= 0 && index < this.fieldCount) {\n      $(\'#\' + this.prefix + \'-wrapper-\' + index).remove();\n      var vals = [];\n      for (i = index + 1; i < this.fieldCount; i += 1)\n      {\n        vals.push($(\'#\' + this.prefix + \'-input-\' + i).val());\n        $(\'#\' + this.prefix + \'-wrapper-\' + i).remove();\n      }\n      this.fieldCount = index;\n      for (i = 0; i < vals.length; i += 1)\n      {\n        this.addField(vals[i]);\n      }\n    }\n  };\n\n  // Check validity of names, mark invalid names, then callback with a\n  // list of names or an empty list on failure.\n  UserFields.prototype.checkNames = function (callback)\n  {\n    this.callback = callback;\n    this.memberNames = {};\n    var foundName = false;\n    var i = 0;\n    for (i = 0; i < this.fieldCount; i += 1) {\n      var newName = $(\'#\' + this.prefix + \'-input-\' + i).val();\n      if (newName.substr(0, 1) !== \'@\')\n      {\n        newName = \'@\' + newName;\n      }\n      if (newName !== \'\' && newName !== \'@\')\n      {\n        this.memberNames[newName] = i;\n        foundName = true;\n      }\n    }\n    if (foundName)\n    {\n      appnet.api.getUserList(Object.keys(this.memberNames),\n                             { include_annotations: 1 },\n                             $.proxy(this.processNames, this),\n                             $.proxy(this.failNames, this));\n    }\n    else\n    {\n      this.callback([]);\n    }\n  };\n\n  UserFields.prototype.failNames = function (response)\n  {\n    util.flagError(this.prefix + \'-error-div\',\n                   \'Could not connect to app.net\');\n    if (this.callback)\n    {\n      this.callback(null);\n    }\n  };\n\n  UserFields.prototype.processNames = function (response)\n  {\n    var validNames = {};\n    var i = 0;\n    for (i = 0; i < response.data.length; i += 1)\n    {\n      validNames[\'@\' + response.data[i].username] = 1;\n    }\n    var keys = Object.keys(this.memberNames);\n    var allOk = true;\n    for (i = 0; i < keys.length; i += 1)\n    {\n      var index = this.memberNames[keys[i]];\n      $(\'#\' + this.prefix + \'-wrapper-\' + index).removeClass(\'error\');\n      if (validNames[keys[i]] === undefined)\n      {\n        allOk = false;\n        $(\'#\' + this.prefix + \'-wrapper-\' + index).addClass(\'error\');\n      }\n    }\n    var callbackArray = null;\n    if (allOk)\n    {\n      callbackArray = keys;\n    }\n    else\n    {\n      util.flagError(this.prefix + \'-error-div\',\n                     \'Fix Invalid Usernames\');\n    }\n    if (this.callback)\n    {\n      this.callback(callbackArray);\n    }\n  };\n\n  UserFields.prototype.hide = function ()\n  {\n    var i = 0;\n    $(\'#\' + this.prefix + \'-more-button\').hide();\n    $(\'#\' + this.prefix + \'-more-div\').hide();\n    for (i = 0; i < this.fieldCount; i += 1) {\n      $(\'#\' + this.prefix + \'-wrapper-\' + i).hide();\n    }\n  };\n\n  UserFields.prototype.show = function ()\n  {\n    var i = 0;\n    $(\'#\' + this.prefix + \'-more-button\').show();\n    $(\'#\' + this.prefix + \'-more-div\').show();\n    for (i = 0; i < this.fieldCount; i += 1) {\n      $(\'#\' + this.prefix + \'-wrapper-\' + i).show();\n    }\n  };\n\n  UserFields.prototype.disable = function ()\n  {\n    var i = 0;\n    $(\'#\' + this.prefix + \'-more-button\').hide();\n    for (i = 0; i < this.fieldCount; i += 1) {\n      $(\'#\' + this.prefix + \'-input-\' + i).attr(\'disabled\', true);\n      $(\'#\' + this.prefix + \'-remove-\' + i).hide();\n    }\n  };\n\n  UserFields.prototype.enable = function ()\n  {\n    var i = 0;\n    $(\'#\' + this.prefix + \'-more-button\').show();\n    for (i = 0; i < this.fieldCount; i += 1) {\n      $(\'#\' + this.prefix + \'-input-\' + i).attr(\'disabled\', false);\n      $(\'#\' + this.prefix + \'-remove-\' + i).show();\n    }\n  };\n\n  UserFields.prototype.reset = function ()\n  {\n    this.enable();\n    while (this.fieldCount > 0) {\n      this.removeField(this.fieldCount - 1);\n    }\n  };\n\n  return UserFields;\n});\n\n//@ sourceURL=/js/UserFields.js");

eval("/**\n * @license RequireJS text 2.0.3 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.\n * Available via the MIT or new BSD license.\n * see: http://github.com/requirejs/text for details\n */\n/*jslint regexp: true */\n/*global require: false, XMLHttpRequest: false, ActiveXObject: false,\n  define: false, window: false, process: false, Packages: false,\n  java: false, location: false */\n\ndefine(\'text\',[\'module\'], function (module) {\n    \'use strict\';\n\n    var text, fs,\n        progIds = [\'Msxml2.XMLHTTP\', \'Microsoft.XMLHTTP\', \'Msxml2.XMLHTTP.4.0\'],\n        xmlRegExp = /^\\s*<\\?xml(\\s)+version=[\\\'\\\"](\\d)*.(\\d)*[\\\'\\\"](\\s)*\\?>/im,\n        bodyRegExp = /<body[^>]*>\\s*([\\s\\S]+)\\s*<\\/body>/im,\n        hasLocation = typeof location !== \'undefined\' && location.href,\n        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\\:/, \'\'),\n        defaultHostName = hasLocation && location.hostname,\n        defaultPort = hasLocation && (location.port || undefined),\n        buildMap = [],\n        masterConfig = (module.config && module.config()) || {};\n\n    text = {\n        version: \'2.0.3\',\n\n        strip: function (content) {\n            //Strips <?xml ...?> declarations so that external SVG and XML\n            //documents can be added to a document without worry. Also, if the string\n            //is an HTML document, only the part inside the body tag is returned.\n            if (content) {\n                content = content.replace(xmlRegExp, \"\");\n                var matches = content.match(bodyRegExp);\n                if (matches) {\n                    content = matches[1];\n                }\n            } else {\n                content = \"\";\n            }\n            return content;\n        },\n\n        jsEscape: function (content) {\n            return content.replace(/([\'\\\\])/g, \'\\\\$1\')\n                .replace(/[\\f]/g, \"\\\\f\")\n                .replace(/[\\b]/g, \"\\\\b\")\n                .replace(/[\\n]/g, \"\\\\n\")\n                .replace(/[\\t]/g, \"\\\\t\")\n                .replace(/[\\r]/g, \"\\\\r\")\n                .replace(/[\\u2028]/g, \"\\\\u2028\")\n                .replace(/[\\u2029]/g, \"\\\\u2029\");\n        },\n\n        createXhr: masterConfig.createXhr || function () {\n            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.\n            var xhr, i, progId;\n            if (typeof XMLHttpRequest !== \"undefined\") {\n                return new XMLHttpRequest();\n            } else if (typeof ActiveXObject !== \"undefined\") {\n                for (i = 0; i < 3; i += 1) {\n                    progId = progIds[i];\n                    try {\n                        xhr = new ActiveXObject(progId);\n                    } catch (e) {}\n\n                    if (xhr) {\n                        progIds = [progId];  // so faster next time\n                        break;\n                    }\n                }\n            }\n\n            return xhr;\n        },\n\n        /**\n         * Parses a resource name into its component parts. Resource names\n         * look like: module/name.ext!strip, where the !strip part is\n         * optional.\n         * @param {String} name the resource name\n         * @returns {Object} with properties \"moduleName\", \"ext\" and \"strip\"\n         * where strip is a boolean.\n         */\n        parseName: function (name) {\n            var strip = false, index = name.indexOf(\".\"),\n                modName = name.substring(0, index),\n                ext = name.substring(index + 1, name.length);\n\n            index = ext.indexOf(\"!\");\n            if (index !== -1) {\n                //Pull off the strip arg.\n                strip = ext.substring(index + 1, ext.length);\n                strip = strip === \"strip\";\n                ext = ext.substring(0, index);\n            }\n\n            return {\n                moduleName: modName,\n                ext: ext,\n                strip: strip\n            };\n        },\n\n        xdRegExp: /^((\\w+)\\:)?\\/\\/([^\\/\\\\]+)/,\n\n        /**\n         * Is an URL on another domain. Only works for browser use, returns\n         * false in non-browser environments. Only used to know if an\n         * optimized .js version of a text resource should be loaded\n         * instead.\n         * @param {String} url\n         * @returns Boolean\n         */\n        useXhr: function (url, protocol, hostname, port) {\n            var uProtocol, uHostName, uPort,\n                match = text.xdRegExp.exec(url);\n            if (!match) {\n                return true;\n            }\n            uProtocol = match[2];\n            uHostName = match[3];\n\n            uHostName = uHostName.split(\':\');\n            uPort = uHostName[1];\n            uHostName = uHostName[0];\n\n            return (!uProtocol || uProtocol === protocol) &&\n                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&\n                   ((!uPort && !uHostName) || uPort === port);\n        },\n\n        finishLoad: function (name, strip, content, onLoad) {\n            content = strip ? text.strip(content) : content;\n            if (masterConfig.isBuild) {\n                buildMap[name] = content;\n            }\n            onLoad(content);\n        },\n\n        load: function (name, req, onLoad, config) {\n            //Name has format: some.module.filext!strip\n            //The strip part is optional.\n            //if strip is present, then that means only get the string contents\n            //inside a body tag in an HTML string. For XML/SVG content it means\n            //removing the <?xml ...?> declarations so the content can be inserted\n            //into the current doc without problems.\n\n            // Do not bother with the work if a build and text will\n            // not be inlined.\n            if (config.isBuild && !config.inlineText) {\n                onLoad();\n                return;\n            }\n\n            masterConfig.isBuild = config.isBuild;\n\n            var parsed = text.parseName(name),\n                nonStripName = parsed.moduleName + \'.\' + parsed.ext,\n                url = req.toUrl(nonStripName),\n                useXhr = (masterConfig.useXhr) ||\n                         text.useXhr;\n\n            //Load the text. Use XHR if possible and in a browser.\n            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {\n                text.get(url, function (content) {\n                    text.finishLoad(name, parsed.strip, content, onLoad);\n                }, function (err) {\n                    if (onLoad.error) {\n                        onLoad.error(err);\n                    }\n                });\n            } else {\n                //Need to fetch the resource across domains. Assume\n                //the resource has been optimized into a JS module. Fetch\n                //by the module name + extension, but do not include the\n                //!strip part to avoid file system issues.\n                req([nonStripName], function (content) {\n                    text.finishLoad(parsed.moduleName + \'.\' + parsed.ext,\n                                    parsed.strip, content, onLoad);\n                });\n            }\n        },\n\n        write: function (pluginName, moduleName, write, config) {\n            if (buildMap.hasOwnProperty(moduleName)) {\n                var content = text.jsEscape(buildMap[moduleName]);\n                write.asModule(pluginName + \"!\" + moduleName,\n                               \"define(function () { return \'\" +\n                                   content +\n                               \"\';});\\n\");\n            }\n        },\n\n        writeFile: function (pluginName, moduleName, req, write, config) {\n            var parsed = text.parseName(moduleName),\n                nonStripName = parsed.moduleName + \'.\' + parsed.ext,\n                //Use a \'.js\' file name so that it indicates it is a\n                //script that can be loaded across domains.\n                fileName = req.toUrl(parsed.moduleName + \'.\' +\n                                     parsed.ext) + \'.js\';\n\n            //Leverage own load() method to load plugin value, but only\n            //write out values that do not have the strip argument,\n            //to avoid any potential issues with ! in file names.\n            text.load(nonStripName, req, function (value) {\n                //Use own write() method to construct full module value.\n                //But need to create shell that translates writeFile\'s\n                //write() to the right interface.\n                var textWrite = function (contents) {\n                    return write(fileName, contents);\n                };\n                textWrite.asModule = function (moduleName, contents) {\n                    return write.asModule(moduleName, fileName, contents);\n                };\n\n                text.write(pluginName, nonStripName, textWrite, config);\n            }, config);\n        }\n    };\n\n    if (masterConfig.env === \'node\' || (!masterConfig.env &&\n            typeof process !== \"undefined\" &&\n            process.versions &&\n            !!process.versions.node)) {\n        //Using special require.nodeRequire, something added by r.js.\n        fs = require.nodeRequire(\'fs\');\n\n        text.get = function (url, callback) {\n            var file = fs.readFileSync(url, \'utf8\');\n            //Remove BOM (Byte Mark Order) from utf8 files if it is there.\n            if (file.indexOf(\'\\uFEFF\') === 0) {\n                file = file.substring(1);\n            }\n            callback(file);\n        };\n    } else if (masterConfig.env === \'xhr\' || (!masterConfig.env &&\n            text.createXhr())) {\n        text.get = function (url, callback, errback) {\n            var xhr = text.createXhr();\n            xhr.open(\'GET\', url, true);\n\n            //Allow overrides specified in config\n            if (masterConfig.onXhr) {\n                masterConfig.onXhr(xhr, url);\n            }\n\n            xhr.onreadystatechange = function (evt) {\n                var status, err;\n                //Do not explicitly handle errors, those should be\n                //visible via console output in the browser.\n                if (xhr.readyState === 4) {\n                    status = xhr.status;\n                    if (status > 399 && status < 600) {\n                        //An http 4xx or 5xx error. Signal an error.\n                        err = new Error(url + \' HTTP status: \' + status);\n                        err.xhr = xhr;\n                        errback(err);\n                    } else {\n                        callback(xhr.responseText);\n                    }\n                }\n            };\n            xhr.send(null);\n        };\n    } else if (masterConfig.env === \'rhino\' || (!masterConfig.env &&\n            typeof Packages !== \'undefined\' && typeof java !== \'undefined\')) {\n        //Why Java, why is this so awkward?\n        text.get = function (url, callback) {\n            var stringBuffer, line,\n                encoding = \"utf-8\",\n                file = new java.io.File(url),\n                lineSeparator = java.lang.System.getProperty(\"line.separator\"),\n                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),\n                content = \'\';\n            try {\n                stringBuffer = new java.lang.StringBuffer();\n                line = input.readLine();\n\n                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324\n                // http://www.unicode.org/faq/utf_bom.html\n\n                // Note that when we use utf-8, the BOM should appear as \"EF BB BF\", but it doesn\'t due to this bug in the JDK:\n                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058\n                if (line && line.length() && line.charAt(0) === 0xfeff) {\n                    // Eat the BOM, since we\'ve already found the encoding on this file,\n                    // and we plan to concatenating this buffer with others; the BOM should\n                    // only appear at the top of a file.\n                    line = line.substring(1);\n                }\n\n                stringBuffer.append(line);\n\n                while ((line = input.readLine()) !== null) {\n                    stringBuffer.append(lineSeparator);\n                    stringBuffer.append(line);\n                }\n                //Make sure we return a JavaScript string and not a Java string.\n                content = String(stringBuffer.toString()); //String\n            } finally {\n                input.close();\n            }\n            callback(content);\n        };\n    }\n\n    return text;\n});\n\n//@ sourceURL=/text.js");

eval("define(\'text!template/editRoomModal.html\',[],function () { return \'<div id=\"edit-room-modal\" class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"editRoomModalLabel\" aria-hidden=\"true\">\\r\\n  <div class=\"modal-header\">\\r\\n    <button id=\"edit-room-x\" type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\\r\\n    <h3 id=\"edit-room-type\">Edit Room</h3>\\r\\n    <h4 id=\"edit-room-owner\">Owned by @user</h4>\\r\\n  </div>\\r\\n  <div class=\"modal-body\">\\r\\n    <p id=\"edit-room-body\">Main body text</p>\\r\\n    <form id=\"edit-room-form\">\\r\\n      <fieldset>\\r\\n        <input type=\"text\" placeholder=\"Name\" id=\"edit-room-name\">\\r\\n      </fieldset>\\r\\n      <fieldset>\\r\\n        <textarea id=\"edit-room-text\" class=\"input-xlarge\"\\r\\n                  rows=\"3\" maxlength=\"256\"\\r\\n                  placeholder=\"Private Message...\"></textarea>\\r\\n      </fieldset>\\r\\n      <fieldset>\\r\\n        <select id=\"edit-room-perm\" class=\"input-medium\">\\r\\n          <option value=\"private\">Private</option>\\r\\n          <option value=\"public\">Public</option>\\r\\n          <option value=\"public-read\">Public Read</option>\\r\\n        </select>\\r\\n        <label id=\"edit-room-perm-label\"></label>\\r\\n      </fieldset>\\r\\n      <fieldset id=\"edit-room-promote-wrapper\">\\r\\n        <label class=\"checkbox\">\\r\\n          <input type=\"checkbox\" id=\"edit-room-promote\">Show this room in the Patter Directory</input>\\r\\n        </label>\\r\\n        <fieldset id=\"edit-room-promo-options\">\\r\\n          <textarea id=\"edit-room-promo-text\" class=\"input-xlarge\"\\r\\n                    rows=\"3\" maxlength=\"256\"\\r\\n                    placeholder=\"Describe Your Room...\"></textarea>\\r\\n          <label class=\"checkbox\">\\r\\n            <input type=\"checkbox\" id=\"edit-fun\">Fun</input>\\r\\n          </label>\\r\\n          <label class=\"checkbox\">\\r\\n            <input type=\"checkbox\" id=\"edit-lifestyle\">Lifestyle</input>\\r\\n          </label>\\r\\n          <label class=\"checkbox\">\\r\\n            <input type=\"checkbox\" id=\"edit-profession\">Professional</input>\\r\\n          </label>\\r\\n          <label class=\"checkbox\">\\r\\n            <input type=\"checkbox\" id=\"edit-language\">Language/Region</input>\\r\\n          </label>\\r\\n          <label class=\"checkbox\">\\r\\n            <input type=\"checkbox\" id=\"edit-community\">Community</input>\\r\\n          </label>\\r\\n          <label class=\"checkbox\">\\r\\n            <input type=\"checkbox\" id=\"edit-tech\">Tech</input>\\r\\n          </label>\\r\\n          <label class=\"checkbox\">\\r\\n            <input type=\"checkbox\" id=\"edit-event\">Event</input>\\r\\n          </label>\\r\\n        </fieldset>\\r\\n      </fieldset>\\r\\n      <div class=\"row-fluid\">\\r\\n        <div class=\"span6\">\\r\\n          <div id=\"edit-room-more-div\" style=\"clear: both;\"></div>\\r\\n        </div>\\r\\n        <div class=\"span1\">\\r\\n          <button class=\"btn btn-success\" id=\"edit-room-more-button\"><i class=\"icon-plus\"></i></button>\\r\\n        </div>\\r\\n      </div>\\r\\n      <div id=\"edit-room-error-div\"></div>\\r\\n    </form>\\r\\n  </div>\\r\\n  <div class=\"modal-footer\">\\r\\n    <button id=\"edit-room-cancel\" class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Cancel</button>\\r\\n    <button id=\"edit-room-save\" data-dismiss=\"modal\" data-loading-text=\"Saving...\" class=\"btn btn-primary\">Save</button>\\r\\n  </div>\\r\\n</div>\\r\\n\';});\n\n//@ sourceURL=/text!template/editRoomModal.html");

/*!
* Bootstrap.js by @fat & @mdo
* Copyright 2012 Twitter, Inc.
* http://www.apache.org/licenses/LICENSE-2.0.txt
*/
!function(e){e(function(){e.support.transition=function(){var e=function(){var e=document.createElement("bootstrap"),t={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},n;for(n in t)if(e.style[n]!==undefined)return t[n]}();return e&&{end:e}}()})}(window.jQuery),!function(e){var t='[data-dismiss="alert"]',n=function(n){e(n).on("click",t,this.close)};n.prototype.close=function(t){function s(){i.trigger("closed").remove()}var n=e(this),r=n.attr("data-target"),i;r||(r=n.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,"")),i=e(r),t&&t.preventDefault(),i.length||(i=n.hasClass("alert")?n:n.parent()),i.trigger(t=e.Event("close"));if(t.isDefaultPrevented())return;i.removeClass("in"),e.support.transition&&i.hasClass("fade")?i.on(e.support.transition.end,s):s()},e.fn.alert=function(t){return this.each(function(){var r=e(this),i=r.data("alert");i||r.data("alert",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.alert.Constructor=n,e(function(){e("body").on("click.alert.data-api",t,n.prototype.close)})}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.button.defaults,n)};t.prototype.setState=function(e){var t="disabled",n=this.$element,r=n.data(),i=n.is("input")?"val":"html";e+="Text",r.resetText||n.data("resetText",n[i]()),n[i](r[e]||this.options[e]),setTimeout(function(){e=="loadingText"?n.addClass(t).attr(t,t):n.removeClass(t).removeAttr(t)},0)},t.prototype.toggle=function(){var e=this.$element.closest('[data-toggle="buttons-radio"]');e&&e.find(".active").removeClass("active"),this.$element.toggleClass("active")},e.fn.button=function(n){return this.each(function(){var r=e(this),i=r.data("button"),s=typeof n=="object"&&n;i||r.data("button",i=new t(this,s)),n=="toggle"?i.toggle():n&&i.setState(n)})},e.fn.button.defaults={loadingText:"loading..."},e.fn.button.Constructor=t,e(function(){e("body").on("click.button.data-api","[data-toggle^=button]",function(t){var n=e(t.target);n.hasClass("btn")||(n=n.closest(".btn")),n.button("toggle")})})}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=n,this.options.slide&&this.slide(this.options.slide),this.options.pause=="hover"&&this.$element.on("mouseenter",e.proxy(this.pause,this)).on("mouseleave",e.proxy(this.cycle,this))};t.prototype={cycle:function(t){return t||(this.paused=!1),this.options.interval&&!this.paused&&(this.interval=setInterval(e.proxy(this.next,this),this.options.interval)),this},to:function(t){var n=this.$element.find(".item.active"),r=n.parent().children(),i=r.index(n),s=this;if(t>r.length-1||t<0)return;return this.sliding?this.$element.one("slid",function(){s.to(t)}):i==t?this.pause().cycle():this.slide(t>i?"next":"prev",e(r[t]))},pause:function(t){return t||(this.paused=!0),this.$element.find(".next, .prev").length&&e.support.transition.end&&(this.$element.trigger(e.support.transition.end),this.cycle()),clearInterval(this.interval),this.interval=null,this},next:function(){if(this.sliding)return;return this.slide("next")},prev:function(){if(this.sliding)return;return this.slide("prev")},slide:function(t,n){var r=this.$element.find(".item.active"),i=n||r[t](),s=this.interval,o=t=="next"?"left":"right",u=t=="next"?"first":"last",a=this,f=e.Event("slide",{relatedTarget:i[0]});this.sliding=!0,s&&this.pause(),i=i.length?i:this.$element.find(".item")[u]();if(i.hasClass("active"))return;if(e.support.transition&&this.$element.hasClass("slide")){this.$element.trigger(f);if(f.isDefaultPrevented())return;i.addClass(t),i[0].offsetWidth,r.addClass(o),i.addClass(o),this.$element.one(e.support.transition.end,function(){i.removeClass([t,o].join(" ")).addClass("active"),r.removeClass(["active",o].join(" ")),a.sliding=!1,setTimeout(function(){a.$element.trigger("slid")},0)})}else{this.$element.trigger(f);if(f.isDefaultPrevented())return;r.removeClass("active"),i.addClass("active"),this.sliding=!1,this.$element.trigger("slid")}return s&&this.cycle(),this}},e.fn.carousel=function(n){return this.each(function(){var r=e(this),i=r.data("carousel"),s=e.extend({},e.fn.carousel.defaults,typeof n=="object"&&n),o=typeof n=="string"?n:s.slide;i||r.data("carousel",i=new t(this,s)),typeof n=="number"?i.to(n):o?i[o]():s.interval&&i.cycle()})},e.fn.carousel.defaults={interval:5e3,pause:"hover"},e.fn.carousel.Constructor=t,e(function(){e("body").on("click.carousel.data-api","[data-slide]",function(t){var n=e(this),r,i=e(n.attr("data-target")||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,"")),s=!i.data("modal")&&e.extend({},i.data(),n.data());i.carousel(s),t.preventDefault()})})}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.collapse.defaults,n),this.options.parent&&(this.$parent=e(this.options.parent)),this.options.toggle&&this.toggle()};t.prototype={constructor:t,dimension:function(){var e=this.$element.hasClass("width");return e?"width":"height"},show:function(){var t,n,r,i;if(this.transitioning)return;t=this.dimension(),n=e.camelCase(["scroll",t].join("-")),r=this.$parent&&this.$parent.find("> .accordion-group > .in");if(r&&r.length){i=r.data("collapse");if(i&&i.transitioning)return;r.collapse("hide"),i||r.data("collapse",null)}this.$element[t](0),this.transition("addClass",e.Event("show"),"shown"),e.support.transition&&this.$element[t](this.$element[0][n])},hide:function(){var t;if(this.transitioning)return;t=this.dimension(),this.reset(this.$element[t]()),this.transition("removeClass",e.Event("hide"),"hidden"),this.$element[t](0)},reset:function(e){var t=this.dimension();return this.$element.removeClass("collapse")[t](e||"auto")[0].offsetWidth,this.$element[e!==null?"addClass":"removeClass"]("collapse"),this},transition:function(t,n,r){var i=this,s=function(){n.type=="show"&&i.reset(),i.transitioning=0,i.$element.trigger(r)};this.$element.trigger(n);if(n.isDefaultPrevented())return;this.transitioning=1,this.$element[t]("in"),e.support.transition&&this.$element.hasClass("collapse")?this.$element.one(e.support.transition.end,s):s()},toggle:function(){this[this.$element.hasClass("in")?"hide":"show"]()}},e.fn.collapse=function(n){return this.each(function(){var r=e(this),i=r.data("collapse"),s=typeof n=="object"&&n;i||r.data("collapse",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.collapse.defaults={toggle:!0},e.fn.collapse.Constructor=t,e(function(){e("body").on("click.collapse.data-api","[data-toggle=collapse]",function(t){var n=e(this),r,i=n.attr("data-target")||t.preventDefault()||(r=n.attr("href"))&&r.replace(/.*(?=#[^\s]+$)/,""),s=e(i).data("collapse")?"toggle":n.data();n[e(i).hasClass("in")?"addClass":"removeClass"]("collapsed"),e(i).collapse(s)})})}(window.jQuery),!function(e){function r(){i(e(t)).removeClass("open")}function i(t){var n=t.attr("data-target"),r;return n||(n=t.attr("href"),n=n&&/#/.test(n)&&n.replace(/.*(?=#[^\s]*$)/,"")),r=e(n),r.length||(r=t.parent()),r}var t="[data-toggle=dropdown]",n=function(t){var n=e(t).on("click.dropdown.data-api",this.toggle);e("html").on("click.dropdown.data-api",function(){n.parent().removeClass("open")})};n.prototype={constructor:n,toggle:function(t){var n=e(this),s,o;if(n.is(".disabled, :disabled"))return;return s=i(n),o=s.hasClass("open"),r(),o||(s.toggleClass("open"),n.focus()),!1},keydown:function(t){var n,r,s,o,u,a;if(!/(38|40|27)/.test(t.keyCode))return;n=e(this),t.preventDefault(),t.stopPropagation();if(n.is(".disabled, :disabled"))return;o=i(n),u=o.hasClass("open");if(!u||u&&t.keyCode==27)return n.click();r=e("[role=menu] li:not(.divider) a",o);if(!r.length)return;a=r.index(r.filter(":focus")),t.keyCode==38&&a>0&&a--,t.keyCode==40&&a<r.length-1&&a++,~a||(a=0),r.eq(a).focus()}},e.fn.dropdown=function(t){return this.each(function(){var r=e(this),i=r.data("dropdown");i||r.data("dropdown",i=new n(this)),typeof t=="string"&&i[t].call(r)})},e.fn.dropdown.Constructor=n,e(function(){e("html").on("click.dropdown.data-api touchstart.dropdown.data-api",r),e("body").on("click.dropdown touchstart.dropdown.data-api",".dropdown form",function(e){e.stopPropagation()}).on("click.dropdown.data-api touchstart.dropdown.data-api",t,n.prototype.toggle).on("keydown.dropdown.data-api touchstart.dropdown.data-api",t+", [role=menu]",n.prototype.keydown)})}(window.jQuery),!function(e){var t=function(t,n){this.options=n,this.$element=e(t).delegate('[data-dismiss="modal"]',"click.dismiss.modal",e.proxy(this.hide,this)),this.options.remote&&this.$element.find(".modal-body").load(this.options.remote)};t.prototype={constructor:t,toggle:function(){return this[this.isShown?"hide":"show"]()},show:function(){var t=this,n=e.Event("show");this.$element.trigger(n);if(this.isShown||n.isDefaultPrevented())return;e("body").addClass("modal-open"),this.isShown=!0,this.escape(),this.backdrop(function(){var n=e.support.transition&&t.$element.hasClass("fade");t.$element.parent().length||t.$element.appendTo(document.body),t.$element.show(),n&&t.$element[0].offsetWidth,t.$element.addClass("in").attr("aria-hidden",!1).focus(),t.enforceFocus(),n?t.$element.one(e.support.transition.end,function(){t.$element.trigger("shown")}):t.$element.trigger("shown")})},hide:function(t){t&&t.preventDefault();var n=this;t=e.Event("hide"),this.$element.trigger(t);if(!this.isShown||t.isDefaultPrevented())return;this.isShown=!1,e("body").removeClass("modal-open"),this.escape(),e(document).off("focusin.modal"),this.$element.removeClass("in").attr("aria-hidden",!0),e.support.transition&&this.$element.hasClass("fade")?this.hideWithTransition():this.hideModal()},enforceFocus:function(){var t=this;e(document).on("focusin.modal",function(e){t.$element[0]!==e.target&&!t.$element.has(e.target).length&&t.$element.focus()})},escape:function(){var e=this;this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.modal",function(t){t.which==27&&e.hide()}):this.isShown||this.$element.off("keyup.dismiss.modal")},hideWithTransition:function(){var t=this,n=setTimeout(function(){t.$element.off(e.support.transition.end),t.hideModal()},500);this.$element.one(e.support.transition.end,function(){clearTimeout(n),t.hideModal()})},hideModal:function(e){this.$element.hide().trigger("hidden"),this.backdrop()},removeBackdrop:function(){this.$backdrop.remove(),this.$backdrop=null},backdrop:function(t){var n=this,r=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var i=e.support.transition&&r;this.$backdrop=e('<div class="modal-backdrop '+r+'" />').appendTo(document.body),this.options.backdrop!="static"&&this.$backdrop.click(e.proxy(this.hide,this)),i&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),i?this.$backdrop.one(e.support.transition.end,t):t()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),e.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(e.support.transition.end,e.proxy(this.removeBackdrop,this)):this.removeBackdrop()):t&&t()}},e.fn.modal=function(n){return this.each(function(){var r=e(this),i=r.data("modal"),s=e.extend({},e.fn.modal.defaults,r.data(),typeof n=="object"&&n);i||r.data("modal",i=new t(this,s)),typeof n=="string"?i[n]():s.show&&i.show()})},e.fn.modal.defaults={backdrop:!0,keyboard:!0,show:!0},e.fn.modal.Constructor=t,e(function(){e("body").on("click.modal.data-api",'[data-toggle="modal"]',function(t){var n=e(this),r=n.attr("href"),i=e(n.attr("data-target")||r&&r.replace(/.*(?=#[^\s]+$)/,"")),s=i.data("modal")?"toggle":e.extend({remote:!/#/.test(r)&&r},i.data(),n.data());t.preventDefault(),i.modal(s).one("hide",function(){n.focus()})})})}(window.jQuery),!function(e){var t=function(e,t){this.init("tooltip",e,t)};t.prototype={constructor:t,init:function(t,n,r){var i,s;this.type=t,this.$element=e(n),this.options=this.getOptions(r),this.enabled=!0,this.options.trigger=="click"?this.$element.on("click."+this.type,this.options.selector,e.proxy(this.toggle,this)):this.options.trigger!="manual"&&(i=this.options.trigger=="hover"?"mouseenter":"focus",s=this.options.trigger=="hover"?"mouseleave":"blur",this.$element.on(i+"."+this.type,this.options.selector,e.proxy(this.enter,this)),this.$element.on(s+"."+this.type,this.options.selector,e.proxy(this.leave,this))),this.options.selector?this._options=e.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},getOptions:function(t){return t=e.extend({},e.fn[this.type].defaults,t,this.$element.data()),t.delay&&typeof t.delay=="number"&&(t.delay={show:t.delay,hide:t.delay}),t},enter:function(t){var n=e(t.currentTarget)[this.type](this._options).data(this.type);if(!n.options.delay||!n.options.delay.show)return n.show();clearTimeout(this.timeout),n.hoverState="in",this.timeout=setTimeout(function(){n.hoverState=="in"&&n.show()},n.options.delay.show)},leave:function(t){var n=e(t.currentTarget)[this.type](this._options).data(this.type);this.timeout&&clearTimeout(this.timeout);if(!n.options.delay||!n.options.delay.hide)return n.hide();n.hoverState="out",this.timeout=setTimeout(function(){n.hoverState=="out"&&n.hide()},n.options.delay.hide)},show:function(){var e,t,n,r,i,s,o;if(this.hasContent()&&this.enabled){e=this.tip(),this.setContent(),this.options.animation&&e.addClass("fade"),s=typeof this.options.placement=="function"?this.options.placement.call(this,e[0],this.$element[0]):this.options.placement,t=/in/.test(s),e.remove().css({top:0,left:0,display:"block"}).appendTo(t?this.$element:document.body),n=this.getPosition(t),r=e[0].offsetWidth,i=e[0].offsetHeight;switch(t?s.split(" ")[1]:s){case"bottom":o={top:n.top+n.height,left:n.left+n.width/2-r/2};break;case"top":o={top:n.top-i,left:n.left+n.width/2-r/2};break;case"left":o={top:n.top+n.height/2-i/2,left:n.left-r};break;case"right":o={top:n.top+n.height/2-i/2,left:n.left+n.width}}e.css(o).addClass(s).addClass("in")}},setContent:function(){var e=this.tip(),t=this.getTitle();e.find(".tooltip-inner")[this.options.html?"html":"text"](t),e.removeClass("fade in top bottom left right")},hide:function(){function r(){var t=setTimeout(function(){n.off(e.support.transition.end).remove()},500);n.one(e.support.transition.end,function(){clearTimeout(t),n.remove()})}var t=this,n=this.tip();return n.removeClass("in"),e.support.transition&&this.$tip.hasClass("fade")?r():n.remove(),this},fixTitle:function(){var e=this.$element;(e.attr("title")||typeof e.attr("data-original-title")!="string")&&e.attr("data-original-title",e.attr("title")||"").removeAttr("title")},hasContent:function(){return this.getTitle()},getPosition:function(t){return e.extend({},t?{top:0,left:0}:this.$element.offset(),{width:this.$element[0].offsetWidth,height:this.$element[0].offsetHeight})},getTitle:function(){var e,t=this.$element,n=this.options;return e=t.attr("data-original-title")||(typeof n.title=="function"?n.title.call(t[0]):n.title),e},tip:function(){return this.$tip=this.$tip||e(this.options.template)},validate:function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},enable:function(){this.enabled=!0},disable:function(){this.enabled=!1},toggleEnabled:function(){this.enabled=!this.enabled},toggle:function(){this[this.tip().hasClass("in")?"hide":"show"]()},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}},e.fn.tooltip=function(n){return this.each(function(){var r=e(this),i=r.data("tooltip"),s=typeof n=="object"&&n;i||r.data("tooltip",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.tooltip.Constructor=t,e.fn.tooltip.defaults={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover",title:"",delay:0,html:!0}}(window.jQuery),!function(e){var t=function(e,t){this.init("popover",e,t)};t.prototype=e.extend({},e.fn.tooltip.Constructor.prototype,{constructor:t,setContent:function(){var e=this.tip(),t=this.getTitle(),n=this.getContent();e.find(".popover-title")[this.options.html?"html":"text"](t),e.find(".popover-content > *")[this.options.html?"html":"text"](n),e.removeClass("fade top bottom left right in")},hasContent:function(){return this.getTitle()||this.getContent()},getContent:function(){var e,t=this.$element,n=this.options;return e=t.attr("data-content")||(typeof n.content=="function"?n.content.call(t[0]):n.content),e},tip:function(){return this.$tip||(this.$tip=e(this.options.template)),this.$tip},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}}),e.fn.popover=function(n){return this.each(function(){var r=e(this),i=r.data("popover"),s=typeof n=="object"&&n;i||r.data("popover",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.popover.Constructor=t,e.fn.popover.defaults=e.extend({},e.fn.tooltip.defaults,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'})}(window.jQuery),!function(e){function t(t,n){var r=e.proxy(this.process,this),i=e(t).is("body")?e(window):e(t),s;this.options=e.extend({},e.fn.scrollspy.defaults,n),this.$scrollElement=i.on("scroll.scroll-spy.data-api",r),this.selector=(this.options.target||(s=e(t).attr("href"))&&s.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.$body=e("body"),this.refresh(),this.process()}t.prototype={constructor:t,refresh:function(){var t=this,n;this.offsets=e([]),this.targets=e([]),n=this.$body.find(this.selector).map(function(){var t=e(this),n=t.data("target")||t.attr("href"),r=/^#\w/.test(n)&&e(n);return r&&r.length&&[[r.position().top,n]]||null}).sort(function(e,t){return e[0]-t[0]}).each(function(){t.offsets.push(this[0]),t.targets.push(this[1])})},process:function(){var e=this.$scrollElement.scrollTop()+this.options.offset,t=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,n=t-this.$scrollElement.height(),r=this.offsets,i=this.targets,s=this.activeTarget,o;if(e>=n)return s!=(o=i.last()[0])&&this.activate(o);for(o=r.length;o--;)s!=i[o]&&e>=r[o]&&(!r[o+1]||e<=r[o+1])&&this.activate(i[o])},activate:function(t){var n,r;this.activeTarget=t,e(this.selector).parent(".active").removeClass("active"),r=this.selector+'[data-target="'+t+'"],'+this.selector+'[href="'+t+'"]',n=e(r).parent("li").addClass("active"),n.parent(".dropdown-menu").length&&(n=n.closest("li.dropdown").addClass("active")),n.trigger("activate")}},e.fn.scrollspy=function(n){return this.each(function(){var r=e(this),i=r.data("scrollspy"),s=typeof n=="object"&&n;i||r.data("scrollspy",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.scrollspy.Constructor=t,e.fn.scrollspy.defaults={offset:10},e(window).on("load",function(){e('[data-spy="scroll"]').each(function(){var t=e(this);t.scrollspy(t.data())})})}(window.jQuery),!function(e){var t=function(t){this.element=e(t)};t.prototype={constructor:t,show:function(){var t=this.element,n=t.closest("ul:not(.dropdown-menu)"),r=t.attr("data-target"),i,s,o;r||(r=t.attr("href"),r=r&&r.replace(/.*(?=#[^\s]*$)/,""));if(t.parent("li").hasClass("active"))return;i=n.find(".active a").last()[0],o=e.Event("show",{relatedTarget:i}),t.trigger(o);if(o.isDefaultPrevented())return;s=e(r),this.activate(t.parent("li"),n),this.activate(s,s.parent(),function(){t.trigger({type:"shown",relatedTarget:i})})},activate:function(t,n,r){function o(){i.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),t.addClass("active"),s?(t[0].offsetWidth,t.addClass("in")):t.removeClass("fade"),t.parent(".dropdown-menu")&&t.closest("li.dropdown").addClass("active"),r&&r()}var i=n.find("> .active"),s=r&&e.support.transition&&i.hasClass("fade");s?i.one(e.support.transition.end,o):o(),i.removeClass("in")}},e.fn.tab=function(n){return this.each(function(){var r=e(this),i=r.data("tab");i||r.data("tab",i=new t(this)),typeof n=="string"&&i[n]()})},e.fn.tab.Constructor=t,e(function(){e("body").on("click.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(t){t.preventDefault(),e(this).tab("show")})})}(window.jQuery),!function(e){var t=function(t,n){this.$element=e(t),this.options=e.extend({},e.fn.typeahead.defaults,n),this.matcher=this.options.matcher||this.matcher,this.sorter=this.options.sorter||this.sorter,this.highlighter=this.options.highlighter||this.highlighter,this.updater=this.options.updater||this.updater,this.$menu=e(this.options.menu).appendTo("body"),this.source=this.options.source,this.shown=!1,this.listen()};t.prototype={constructor:t,select:function(){var e=this.$menu.find(".active").attr("data-value");return this.$element.val(this.updater(e)).change(),this.hide()},updater:function(e){return e},show:function(){var t=e.extend({},this.$element.offset(),{height:this.$element[0].offsetHeight});return this.$menu.css({top:t.top+t.height,left:t.left}),this.$menu.show(),this.shown=!0,this},hide:function(){return this.$menu.hide(),this.shown=!1,this},lookup:function(t){var n;return this.query=this.$element.val(),!this.query||this.query.length<this.options.minLength?this.shown?this.hide():this:(n=e.isFunction(this.source)?this.source(this.query,e.proxy(this.process,this)):this.source,n?this.process(n):this)},process:function(t){var n=this;return t=e.grep(t,function(e){return n.matcher(e)}),t=this.sorter(t),t.length?this.render(t.slice(0,this.options.items)).show():this.shown?this.hide():this},matcher:function(e){return~e.toLowerCase().indexOf(this.query.toLowerCase())},sorter:function(e){var t=[],n=[],r=[],i;while(i=e.shift())i.toLowerCase().indexOf(this.query.toLowerCase())?~i.indexOf(this.query)?n.push(i):r.push(i):t.push(i);return t.concat(n,r)},highlighter:function(e){var t=this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&");return e.replace(new RegExp("("+t+")","ig"),function(e,t){return"<strong>"+t+"</strong>"})},render:function(t){var n=this;return t=e(t).map(function(t,r){return t=e(n.options.item).attr("data-value",r),t.find("a").html(n.highlighter(r)),t[0]}),t.first().addClass("active"),this.$menu.html(t),this},next:function(t){var n=this.$menu.find(".active").removeClass("active"),r=n.next();r.length||(r=e(this.$menu.find("li")[0])),r.addClass("active")},prev:function(e){var t=this.$menu.find(".active").removeClass("active"),n=t.prev();n.length||(n=this.$menu.find("li").last()),n.addClass("active")},listen:function(){this.$element.on("blur",e.proxy(this.blur,this)).on("keypress",e.proxy(this.keypress,this)).on("keyup",e.proxy(this.keyup,this)),(e.browser.chrome||e.browser.webkit||e.browser.msie)&&this.$element.on("keydown",e.proxy(this.keydown,this)),this.$menu.on("click",e.proxy(this.click,this)).on("mouseenter","li",e.proxy(this.mouseenter,this))},move:function(e){if(!this.shown)return;switch(e.keyCode){case 9:case 13:case 27:e.preventDefault();break;case 38:e.preventDefault(),this.prev();break;case 40:e.preventDefault(),this.next()}e.stopPropagation()},keydown:function(t){this.suppressKeyPressRepeat=!~e.inArray(t.keyCode,[40,38,9,13,27]),this.move(t)},keypress:function(e){if(this.suppressKeyPressRepeat)return;this.move(e)},keyup:function(e){switch(e.keyCode){case 40:case 38:break;case 9:case 13:if(!this.shown)return;this.select();break;case 27:if(!this.shown)return;this.hide();break;default:this.lookup()}e.stopPropagation(),e.preventDefault()},blur:function(e){var t=this;setTimeout(function(){t.hide()},150)},click:function(e){e.stopPropagation(),e.preventDefault(),this.select()},mouseenter:function(t){this.$menu.find(".active").removeClass("active"),e(t.currentTarget).addClass("active")}},e.fn.typeahead=function(n){return this.each(function(){var r=e(this),i=r.data("typeahead"),s=typeof n=="object"&&n;i||r.data("typeahead",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.typeahead.defaults={source:[],items:8,menu:'<ul class="typeahead dropdown-menu"></ul>',item:'<li><a href="#"></a></li>',minLength:1},e.fn.typeahead.Constructor=t,e(function(){e("body").on("focus.typeahead.data-api",'[data-provide="typeahead"]',function(t){var n=e(this);if(n.data("typeahead"))return;t.preventDefault(),n.typeahead(n.data())})})}(window.jQuery),!function(e){var t=function(t,n){this.options=e.extend({},e.fn.affix.defaults,n),this.$window=e(window).on("scroll.affix.data-api",e.proxy(this.checkPosition,this)),this.$element=e(t),this.checkPosition()};t.prototype.checkPosition=function(){if(!this.$element.is(":visible"))return;var t=e(document).height(),n=this.$window.scrollTop(),r=this.$element.offset(),i=this.options.offset,s=i.bottom,o=i.top,u="affix affix-top affix-bottom",a;typeof i!="object"&&(s=o=i),typeof o=="function"&&(o=i.top()),typeof s=="function"&&(s=i.bottom()),a=this.unpin!=null&&n+this.unpin<=r.top?!1:s!=null&&r.top+this.$element.height()>=t-s?"bottom":o!=null&&n<=o?"top":!1;if(this.affixed===a)return;this.affixed=a,this.unpin=a=="bottom"?r.top-n:null,this.$element.removeClass(u).addClass("affix"+(a?"-"+a:""))},e.fn.affix=function(n){return this.each(function(){var r=e(this),i=r.data("affix"),s=typeof n=="object"&&n;i||r.data("affix",i=new t(this,s)),typeof n=="string"&&i[n]()})},e.fn.affix.Constructor=t,e.fn.affix.defaults={offset:0},e(window).on("load",function(){e('[data-spy="affix"]').each(function(){var t=e(this),n=t.data();n.offset=n.offset||{},n.offsetBottom&&(n.offset.bottom=n.offsetBottom),n.offsetTop&&(n.offset.top=n.offsetTop),t.affix(n)})})}(window.jQuery);
define("bootstrap", function(){});

eval("// editRoomModal.js\n//\n// A dialog box for editing or viewing the properties of the current\n// room. This may also be used as a dialog for creating a new room.\n\n/*global define:true */\ndefine(\'js/editRoomModal\',[\'jquery\', \'util\', \'appnet\', \'js/roomInfo\',\n        \'js/UserFields\',\n        \'text!template/editRoomModal.html\', \'bootstrap\'],\nfunction ($, util, appnet, roomInfo, UserFields, editTemplate) {\n  \'use strict\';\n\n  var categories = [\'fun\', \'lifestyle\', \'profession\', \'language\',\n                    \'community\', \'tech\', \'event\'];\n\n  var editRoomModal = {\n  };\n\n  var editRoomFields = null;\n  var editRoomChannel = null;\n  var editRoomType = null;\n\n  editRoomModal.init = function ()\n  {\n    $(\'#modal-container\').append(editTemplate);\n    editRoomFields = new UserFields(\'edit-room\');\n    $(\'#edit-room-save\').click(clickSave);\n    $(\'#edit-room-perm\').on(\'change\', function (event) {\n      updatePatterPerm();\n    });\n    $(\'#edit-room-promote\').on(\'change\', function (event) {\n      updatePatterPerm();\n    });\n    $(\'#edit-room-form\').on(\'submit\', function (event) {\n      event.preventDefault();\n      $(\'#edit-room-save\').click();\n      return false;\n    });\n  };\n\n  editRoomModal.show = function ()\n  {\n    $(\'#edit-room-modal\').modal();\n  };\n\n  editRoomModal.canEditChannel = function (channel) {\n    return channel.you_can_edit &&\n      (channel.type === \'net.patter-app.room\' ||\n       ! channel.writers.immutable ||\n       ! channel.readers.immutable);\n  };\n\n  editRoomModal.update = function (newChannel, newType)\n  {\n    var i = 0;\n    var j = 0;\n    editRoomChannel = newChannel;\n    editRoomType = newType;\n    var canEdit = true;\n    if (editRoomChannel !== null) {\n      canEdit = this.canEditChannel(editRoomChannel);\n      editRoomType = editRoomChannel.type;\n    }\n    var settings = appnet.note.findPatterSettings(editRoomChannel);\n\n    // Modal Title\n    var roomType = \'Create \';\n    if (editRoomChannel !== null && canEdit) {\n      roomType = \'Edit \';\n    } else if (editRoomChannel !== null) {\n      roomType = \'View \';\n    }\n    if (editRoomType === \'net.patter-app.room\') {\n      roomType += \'Patter Room\';\n    } else if (editRoomType === \'net.app.core.pm\') {\n      roomType += \'PM Channel\';\n    }\n    $(\'#edit-room-type\').html(roomType);\n    \n    // Modal subtitle\n    var ownerText = \'\';\n    if (editRoomChannel !== null) {\n      ownerText = \'Owned by @\' + editRoomChannel.owner.username;\n    }\n    $(\'#edit-room-owner\').html(ownerText);\n    \n    $(\'#edit-room-body\').hide();\n    if (editRoomChannel === null) {\n      if (editRoomType === \'net.patter-app.room\') {\n        $(\'#edit-room-body\').html(\'Patter rooms may be public or private and the owner can modify permissions after they are created.\');\n        $(\'#edit-room-body\').show();\n      } else if (editRoomType === \'net.app.core.pm\') {\n        $(\'#edit-room-body\').html(\'Private message channels are always private, and you cannot change their permissions.\');\n        $(\'#edit-room-body\').show();\n      }\n    }\n\n    // Set name field\n    if (editRoomType === \'net.patter-app.room\') {\n      $(\'#edit-room-name\').show();\n    } else {\n      $(\'#edit-room-name\').hide();\n    }\n    \n    $(\'#edit-room-text\').val(\'\');\n    if (editRoomChannel === null && editRoomType === \'net.app.core.pm\') {\n      $(\'#edit-room-text\').show();\n    } else {\n      $(\'#edit-room-text\').hide();\n    }\n\n    $(\'#edit-room-perm\').removeAttr(\'disabled\');\n    if (editRoomType === \'net.app.core.pm\') {\n      $(\'#edit-room-perm\').attr(\'disabled\', true);\n      $(\'#edit-room-perm\').val(\'private\');\n    } else if (editRoomChannel !== null &&\n               (editRoomChannel.writers[\'public\'] ||\n                editRoomChannel.writers.any_user)) {\n      $(\'#edit-room-perm\').val(\'public\');\n    } else if (editRoomChannel !== null &&\n               (editRoomChannel.readers[\'public\'] ||\n                editRoomChannel.readers.any_user)) {\n      $(\'#edit-room-perm\').val(\'public-read\');\n    } else {\n      $(\'#edit-room-perm\').val(\'private\');\n    }\n\n    if (settings.name)\n    {\n      $(\'#edit-room-name\').val(settings.name);\n    }\n    else\n    {\n      $(\'#edit-room-name\').val(\'\');\n    }\n\n    if (settings.blurb && settings.blurb_id)\n    {\n      $(\'#edit-room-promo-text\').val(settings.blurb);\n      $(\'#edit-room-promote\').attr(\'checked\', \'checked\');\n    }\n    else\n    {\n      $(\'#edit-room-promo-text\').val(\'\');\n      $(\'#edit-room-promote\').removeAttr(\'checked\');\n    }\n\n    if (settings.categories)\n    {\n      for (i = 0; i < categories.length; i += 1)\n      {\n        $(\'#edit-\' + categories[i]).removeAttr(\'checked\');\n      }\n\n      for (i = 0; i < settings.categories.length; i += 1)\n      {\n        for (j = 0; j < categories.length; j += 1)\n        {\n          if (settings.categories[i] === categories[j])\n          {\n            $(\'#edit-\' + categories[j]).attr(\'checked\', \'checked\');\n          }\n        }\n      }\n    }\n\n    editRoomFields.reset();\n    if (editRoomChannel !== null)\n    {\n      var keys = Object.keys(roomInfo.members);\n      for (i = 0; i < keys.length; i += 1) {\n        editRoomFields.addField(\'@\' + keys[i]);\n      }\n    }\n    if (canEdit) {\n      editRoomFields.addField();\n    }\n    if (canEdit) {\n      $(\'#edit-room-save\').show();\n      $(\'#edit-room-cancel\').html(\'Cancel\');\n      if (editRoomChannel !== null && editRoomChannel.writers.immutable) {\n        $(\'#edit-room-perm\').attr(\'disabled\', true);\n        editRoomFields.disable();\n      } else {\n        editRoomFields.enable();\n      }\n      if (editRoomChannel !== null && editRoomChannel.readers.immutable) {\n        $(\'#edit-room-perm\').attr(\'disabled\', true);\n      }\n    } else {\n      $(\'#edit-room-save\').hide();\n      $(\'#edit-room-cancel\').html(\'Back\');\n      $(\'#edit-room-name\').attr(\'disabled\', true);\n      $(\'#edit-room-perm\').attr(\'disabled\', true);\n      editRoomFields.disable();\n    }\n    if (editRoomChannel === null)\n    {\n      $(\'#edit-room-save\').html(\'Create\');\n    }\n    else\n    {\n      $(\'#edit-room-save\').html(\'Save\');\n    }\n    $(\'#edit-room-error-div\').html(\'\');\n    updatePatterPerm();\n  };\n\n  function completeEditRoom(names) {\n    var settings = appnet.note.findPatterSettings(editRoomChannel);\n    if (names && names.length === 0 &&\n        editRoomType === \'net.app.core.pm\') {\n      util.flagError(\'pm-create-fields-error-div\', \'You need at least one recipient\');\n    } else if (names) {\n      if (editRoomType === \'net.app.core.pm\') {\n        createPmChannel(names);\n      } else {\n        if (editRoomChannel === null) {\n          createPatterChannel(names);\n        } else {\n          if (getPromo() === \'\' || settings.blurb_id) {\n            changePatterChannel(editRoomChannel, names);\n          } else {\n            createBlurb(editRoomChannel, names);\n          }\n        }\n      }\n      $(\'#edit-room-modal\').modal(\'hide\');\n    }\n    enableEditRoom();\n  }\n\n  function disableEditRoom() {\n    $(\'#edit-room-x\').attr(\'disabled\', true);\n    $(\'#edit-room-name\').attr(\'disabled\', true);\n    $(\'#edit-room-text\').attr(\'disabled\', true);\n    $(\'#edit-room-perm\').attr(\'disabled\', true);\n    $(\'#edit-room-cancel\').attr(\'disabled\', true);\n    $(\'#edit-room-save\').button(\'loading\');\n    editRoomFields.disable();\n  }\n\n  function enableEditRoom() {\n    $(\'#edit-room-x\').removeAttr(\'disabled\');\n    $(\'#edit-room-name\').removeAttr(\'disabled\');\n    $(\'#edit-room-text\').removeAttr(\'disabled\');\n    $(\'#edit-room-perm\').removeAttr(\'disabled\');\n    $(\'#edit-room-cancel\').removeAttr(\'disabled\');\n    $(\'#edit-room-save\').button(\'reset\');\n    editRoomFields.enable();\n  }\n\n  function getPatterAccess(perm, members, oldChannel)\n  {\n    var channel = { auto_subscribe: true };\n    if (! oldChannel || ! oldChannel.writers.immutable) {\n      var canWrite = (perm === \'public\');\n      var writers = {\n        immutable: false,\n        any_user: canWrite\n      };\n      if (! canWrite)\n      {\n        writers.user_ids = members;\n      }\n      channel.writers = writers;\n    }\n    if (! oldChannel || ! oldChannel.readers.immutable) {\n      var canRead = (perm === \'public\' || perm === \'public-read\');\n      var readers = {\n        immutable: false,\n        \'public\': canRead\n      };\n      channel.readers = readers;\n    }\n\n    return channel;\n  }\n\n  function getPatterNotes(channel, name, promo, blurbId)\n  {\n    var annotations = [];\n    var settings = appnet.note.findPatterSettings(channel);\n    var cats = [];\n    var i = 0;\n    var settingsNote = {\n      type: \'net.patter-app.settings\',\n      value: { name: name }\n    };\n    if (promo === \'\' && settings.blurb_id) {\n      appnet.api.deleteMessage(\'1614\', settings.blurb_id,\n                               null, null, null);\n    } else if (promo !== \'\' && ! blurbId && settings.blurb_id) {\n      blurbId = settings.blurb_id;\n    }\n    if (blurbId) {\n      settingsNote.value.blurb_id = blurbId;\n      settingsNote.value.blurb = promo;\n      for (i = 0; i < categories.length; i += 1)\n      {\n        if ($(\'#edit-\' + categories[i]).attr(\'checked\'))\n        {\n          cats.push(categories[i]);\n        }\n      }\n      settingsNote.value.categories = cats;\n    }\n    annotations.push(settingsNote);\n    var fallback = {\n      type: \'net.app.core.fallback_url\',\n      value: {\n        url: \'http://patter-app.net/room.html?channel=\' + channel.id\n      }\n    };\n    annotations.push(fallback);\n    return annotations;\n  }\n\n  function updatePatterPerm() {\n    var perm = $(\'#edit-room-perm\');\n    var label = $(\'#edit-room-perm-label\');\n    var pwrapper = $(\'#edit-room-promote-wrapper\');\n    var pbox = $(\'#edit-room-promote\');\n    var poptions = $(\'#edit-room-promo-options\');\n    var fields = editRoomFields;\n\n    if (perm.val() === \'private\' ||\n        (editRoomChannel !== null &&\n         ! editRoomModal.canEditChannel(editRoomChannel))) {\n      pwrapper.hide();\n    } else {\n      pwrapper.show();\n    }\n\n    if (pbox.attr(\'checked\')) {\n      poptions.show();\n    } else {\n      poptions.hide();\n    }\n\n    if (perm.val() === \'public\') {\n      fields.hide();\n    } else {\n      fields.show();\n    }\n    if (perm.val() === \'private\') {\n      label.html(\'This room is private and only accessible by its members.\');\n    } else if (perm.val() === \'public\') {\n      label.html(\'This room is public and anyone may join or view it.\');\n    } else if (perm.val() === \'public-read\') {\n      label.html(\'Only members may participate, but anyone may view this room.\');\n    }\n  }\n\n  function getPromo()\n  {\n    var promo = \'\';\n    if ($(\'#edit-room-promote\').attr(\'checked\'))\n    {\n      promo = $(\'#edit-room-promo-text\').val();\n    }\n    return promo;\n  }\n\n  function changePatterChannel(oldChannel, names, blurbId, callback) {\n    if (names)\n    {\n      var success = $.proxy(roomInfo.completeChannelInfo, roomInfo);\n      if (callback)\n      {\n        success = callback;\n      }\n      var channel = getPatterAccess($(\'#edit-room-perm\').val(),\n                                    names, oldChannel);\n      channel.annotations = getPatterNotes(oldChannel,\n                                           $(\'#edit-room-name\').val(),\n                                           getPromo(), blurbId);\n      appnet.api.updateChannel(oldChannel.id, channel, {include_annotations: 1},\n                               success, null);\n      $(\'#edit-room-modal\').modal(\'hide\');\n    }\n    enableEditRoom();\n  }\n\n  function createPmChannel(names)\n  {\n    var text = $(\'#edit-room-text\').val();\n    var message = { text: text,\n                    destinations: names };\n    appnet.api.createMessage(\'pm\', message, { include_annotations: 1 },\n                             completeCreatePm, failCreatePm);\n  }\n\n  function completeCreatePm(response)\n  {\n    util.redirect(\'room.html?channel=\' + response.data.channel_id);\n  }\n\n  function failCreatePm(meta)\n  {\n    util.flagError(\'edit-room-error-div\', \'Create PM Request Failed\');\n  }\n\n  function createBlurb(channel, names, callback)\n  {\n    var name = $(\'#edit-room-name\').val();\n    var context = {\n      channel: channel,\n      names: names,\n      callback: callback\n    };\n    var message = {\n      text: getPromo(),\n      annotations: [{\n        type: \'net.app.core.channel.invite\',\n        value: {\n          \'channel_id\': channel.id\n        }\n      }]\n    };\n    appnet.api.createMessage(\'1614\', message, null,\n                             $.proxy(completeBlurb, context),\n                             failCreatePatter);\n  }\n\n  var completeBlurb = function (response)\n  {\n    changePatterChannel(this.channel, this.names, response.data.id,\n                        this.callback);\n  };\n\n  function createPatterChannel(names)\n  {\n    var context = {\n      names: names\n    };\n    var channel = {\n      type: \'net.patter-app.room\'\n    };\n    appnet.api.createChannel(channel, { include_annotations: 1 },\n                             $.proxy(completeCreatePatter, context),\n                             $.proxy(failCreatePatter, context));\n  }\n\n  var completeCreatePatter = function (response)\n  {\n    if (getPromo() === \'\') {\n      changePatterChannel(response.data, this.names, null, redirectToChannel);\n    } else {\n      createBlurb(response.data, this.names, redirectToChannel);\n    }\n  };\n\n  var failCreatePatter = function (meta)\n  {\n    if (this.blurbId)\n    {\n      appnet.api.deleteMessage(\'1614\', this.blurbId, null, null, null);\n    }\n    util.flagError(\'edit-room-error-div\', \'Create Patter Room Request Failed\');\n  };\n\n  function redirectToChannel(response)\n  {\n    util.redirect(\'room.html?channel=\' + response.data.id);\n  }\n\n  function clickSave(event) {\n    event.preventDefault();\n    if ($(\'#edit-room-name\').val() === \'\' &&\n        editRoomType === \'net.patter-app.room\') {\n      util.flagError(\'edit-room-error-div\', \'You must specify a name\');\n    } else if ($(\'#edit-room-text\').val() === \'\' &&\n               editRoomType === \'net.app.core.pm\') {\n      util.flagError(\'edit-room-error-div\', \'You must compose a message\');\n    } else {\n      disableEditRoom();\n      editRoomFields.checkNames(completeEditRoom);\n    }\n    return false;\n  }\n\n  return editRoomModal;\n});\n\n//@ sourceURL=/js/editRoomModal.js");

eval("// Category.js\r\n//\r\n// Handler for a category of room in the lobby\r\n\r\n/*global define: true */\r\ndefine(\'js/Category\',[\'jquery\', \'appnet\'], function ($, appnet) {\r\n  \'use strict\';\r\n\r\n  function Category(id, title)\r\n  {\r\n    this.id = id;\r\n    this.wrapper = $(\'#\' + id);\r\n    this.tag = $(\'<div class=\"span6 offset3\"/>\');\r\n    this.title = title;\r\n  }\r\n\r\n  Category.prototype.match = function (channel)\r\n  {\r\n    var found = false;\r\n    var settings = appnet.note.findPatterSettings(channel);\r\n    var i = 0;\r\n    if (settings.categories && settings.categories.length)\r\n    {\r\n      for (i = 0; i < settings.categories.length; i += 1)\r\n      {\r\n        if (settings.categories[i] === this.id)\r\n        {\r\n          found = true;\r\n          break;\r\n        }\r\n      }\r\n    }\r\n    return found;\r\n  };\r\n\r\n  return Category;\r\n});\r\n\n//@ sourceURL=/js/Category.js");

/*
 * jQuery EasyDate 0.2.4 ($Rev: 54 $)
 * Copyright (c) 2009 Parsha Pourkhomami (parshap@gmail.com)
 * Licensed under the MIT license.
 */
(function(e){e.easydate={};e.easydate.locales={};e.easydate.locales.enUS={future_format:"%s %t",past_format:"%t %s",second:"second",seconds:"seconds",minute:"minute",minutes:"minutes",hour:"hour",hours:"hours",day:"day",days:"days",week:"week",weeks:"weeks",month:"month",months:"months",year:"year",years:"years",yesterday:"yesterday",tomorrow:"tomorrow",now:"just now",ago:"ago","in":"in"};var d={live:true,set_title:true,format_future:true,format_past:true,units:[{name:"now",limit:5},{name:"second",limit:60,in_seconds:1},{name:"minute",limit:3600,in_seconds:60},{name:"hour",limit:86400,in_seconds:3600},{name:"yesterday",limit:172800,past_only:true},{name:"tomorrow",limit:172800,future_only:true},{name:"day",limit:604800,in_seconds:86400},{name:"week",limit:2629743,in_seconds:604800},{name:"month",limit:31556926,in_seconds:2629743},{name:"year",limit:Infinity,in_seconds:31556926}],uneasy_format:function(p){return p.toLocaleDateString()},locale:e.easydate.locales.enUS};var f=0;var k={};var h={};var a={};function l(r,q,p){if(!isNaN(q)&&q!=1){r=r+"s"}return p.locale[r]||r}var o=e.easydate.pause=function(q){var s=function(p){clearTimeout(k[p]);delete k[p];h[p]=true};if(!q){for(var r in k){s(r)}}else{e(q).each(function(){var p=jQuery.data(this);if(!isNaN(k[p])){s(p)}})}};var c=e.easydate.resume=function(p){var s=function(r){delete h[r];b(a[r])};if(!p){for(var q in h){s(q)}}else{e(p).each(function(){var r=jQuery.data(this);if(!isNaN(h[r])){s(r)}})}};var g=e.easydate.set_now=function(q){var r;if(q instanceof Date){r=q.getTime()}else{r=Date.parse(q)}if(isNaN(r)){return}f=r-(new Date()).getTime();for(var p in a){if(!isNaN[k[p]]){clearTimeout(k[p])}b(a[p])}};var n=e.easydate.get_now=function(){var p=new Date();p.setTime(p.getTime()+f);return p};var j=e.easydate.format_date=function(q,x){var r=e.extend({},d,x);var v=((n().getTime()-q.getTime())/1000);var u=Math.abs(v);if(isNaN(v)){return}if((!r.format_future&&v<0)||(!r.format_past&&v>0)){return}for(var s in r.units){var w=r.units[s];if((w.past_only&&v<0)||(w.future_only&&v>0)){continue}if(u<w.limit){if(isNaN(w.in_seconds)){return l(w.name,NaN,r)}var p=u/w.in_seconds;p=Math.round(p);var t;if(v<0){t=l("future_format",NaN,r).replace("%s",l("in",NaN,r))}else{t=l("past_format",NaN,r).replace("%s",l("ago",NaN,r))}return t.replace("%t",p+" "+l(w.name,p,r))}}return r.uneasy_format(q)};function m(r,t){var q=n();var w=((q.getTime()-r.getTime())/1000);var p=Math.abs(w);if(isNaN(w)){return}var v=0;for(var s in t.units){var u=t.units[s];if((u.past_only&&w<0)||(u.future_only&&w>0)){continue}if(p<u.limit){if(isNaN(u.in_seconds)){if(w<0){return(v-p)*1000+100}else{return(u.limit-p)*1000+100}}else{if(w<0){return(p%u.in_seconds)*1000+100}else{return(u.in_seconds-(p%u.in_seconds))*1000+100}}}v=u.limit}if(w<0){for(var s=t.units.length-1;s>=0;s--){var u=t.units[s];if(u.past_only){continue}return(u.limit-p)*1000+100}}}function i(q,r){var p=q.data("easydate.date");if(isNaN(p)){var s;var t=Date.parse(s=q.attr("title"))||Date.parse(s=q.html());if(!isNaN(t)){p=new Date();p.setTime(t);q.data("easydate.date",p);if(r.set_title&&!q.attr("title")){q.attr("title",s)}}}return p}function b(r){var s=r.data("easydate.settings");var p=e.data(r[0]);a[p]=r;delete k[p];var q=i(r,s);if(isNaN(q)){return}r.html(j(q,s));if(s.live){var t=m(q,s);if(!isNaN(t)){if(t>2147483647){t=2147483647}var u=setTimeout(function(){b(r)},Math.round(t));k[p]=u}}}e.fn.easydate=function(p){var q=e.extend({},d,p);this.data("easydate.settings",q);this.removeData("easydate.date");this.each(function(){var r=e.data(this);if(!isNaN(k[r])){clearTimeout(k[r]);delete k[r]}b(e(this))})}})(jQuery);
define("jquery-easydate", function(){});

// lobby.js
//
// Overall task for managing a list of subscribed channels

/*global require: true */
require(['jquery', 'util', 'appnet', 'js/editRoomModal',
         'js/Category',
         'bootstrap', 'jquery-easydate'],
function ($, util, appnet, editRoomModal, Category) {
  

  var wait = 1 * 1000;
  var checkWait = 30 * 1000;

  var cats = [new Category('fun', 'Fun'),
              new Category('lifestyle', 'Lifestyle'),
              new Category('profession', 'Professional'),
              new Category('language', 'Language/Region'),
              new Category('community', 'Community'),
              new Category('tech', 'Tech'),
              new Category('event', 'Event')];

  var currentUser = null;
  var recentPostId = {};
  var hasNotified = false;

  function initialize() {
    $.removeCookie('patterAccessToken', { path: '/' });
    appnet.init('patter2Token', 'patterPrevUrl');

    if (! appnet.isLogged())
    {
      util.redirect('auth.html');
    }

//    $("#main-fail").hide();
//    $("#loading-modal").modal({backdrop: 'static',
//      keyboard: false});
    initButtons();
    appnet.updateUser(completeUserInfo, failUserInfo);
  }

  function completeUserInfo(response) {
    currentUser = response.data;
//    $('#loading-message').html("Fetching Channels");
//    processPublicChannels();
    fetchEvent();
  }

  function sortChannels(channelList)
  {
    channelList.sort(function (left, right) {
      var result = 0;
      if (left.recent_message_id && right.recent_message_id) {
        result = parseInt(right.recent_message_id, 10) -
          parseInt(left.recent_message_id, 10);
      } else if (left.recent_message_id) {
        result = -1;
      } else if (right.recent_message_id) {
        result = 1;
      }
      return result;
    });
  }

  function failUserInfo(meta) {
    util.redirect('auth.html');
  }

  var processChannelTimer = null;

  var publicChannels = [];
  var lastDirectoryCount;
  var channels = [];

  var shownChannels = false;
  var gettingPublic = false;
  var refreshPublic = true;

  var channelMembers = {};

  function fetchEvent()
  {
    var options = {
      include_annotations: 1,
      include_recent_message: 1,
      channel_types: 'net.app.core.pm,net.patter-app.room'
    };
    clearTimeout(processChannelTimer);
    processChannelTimer = setTimeout(fetchEvent, wait);
    if (shownChannels)
    {
      if (gettingPublic)
      {
        getPublicRooms();
      }
      else
      {
        appnet.api.getAllSubscriptions(options, processMyChannels,
                                       failChannelList);
      }
    }
    else
    {
      appnet.api.getSubscriptions(options, processMyChannels, failChannelList);
    }
    shownChannels = true;
    gettingPublic = ! gettingPublic;
  }

  function getPublicRooms()
  {
    if (refreshPublic)
    {
      appnet.api.getChannel('1614', { include_annotations: 1 },
                            processDirectory, failChannelList);
    }
    else
    {
      appnet.api.getAllChannelList(publicChannels, { include_annotations: 1, include_recent_message: 1 },
                                   processPublicChannels, failChannelList);
      wait = checkWait;
    }
    refreshPublic = ! refreshPublic;
  }

  function processMyChannels(response)
  {
    processUsers(response, $.proxy(processMine, response));
  }

  var processMine = function (response)
  {
    updateChannelUsers(response.data);

    sortChannels(this.data);
    var hasHome = false;
    var hasRoom = false;
    var hasPm = false;
    var home = $('<div class="span8"/>');
    home.append('<h3>Home</h3>');
    var rooms = $('<div class="span8"/>');
    rooms.append('<h3>My Rooms</h3>');
    var pms = $('<div class="span8"/>');
    pms.append('<h3>Private Messages</h3>');
    var i = 0;
    for (i = 0; i < this.data.length; i += 1)
    {
      if (i <= 8)
      {
        home.append(renderChannel(this.data[i]));
        if (this.data[i].has_unread)
        {
          hasHome = true;
        }
      }
      if (this.data[i].type === 'net.patter-app.room')
      {
        rooms.append(renderChannel(this.data[i]));
        if (this.data[i].has_unread)
        {
          hasRoom = true;
        }
      }
      else if (this.data[i].type === 'net.app.core.pm')
      {
        pms.append(renderChannel(this.data[i]));
        if (this.data[i].has_unread)
        {
          hasPm = true;
        }
      }
    }
    $('#home-wrapper').html(home);
    $('#rooms').html(rooms);
    $('#pms').html(pms);
    if (hasHome) {
      $('#home-tab').addClass('alert-success');
    } else {
      $('#home-tab').removeClass('alert-success');
    }
    if (hasRoom) {
      $('#room-tab').addClass('alert-success');
    } else {
      $('#room-tab').removeClass('alert-success');
    }
    if (hasPm) {
      $('#pm-tab').addClass('alert-success');
    } else {
      $('#pm-tab').removeClass('alert-success');
    }
  };

  function processDirectory(response)
  {
    var options = {
      include_annotations: 1,
      include_deleted: 0
    };
    if (response.data.counts.messages !== lastDirectoryCount)
    {
      lastDirectoryCount = response.data.counts.messages;
      appnet.api.getAllMessages('1614', options,
                                processDirectoryMessages, failChannelList);
    }
    else
    {
      appnet.api.getAllChannelList(publicChannels, { include_annotations: 1, include_recent_message: 1 },
                                   processPublicChannels, failChannelList);
    }
  }

  function processDirectoryMessages(response)
  {
    publicChannels = [];
    var i = 0;
    for (i = 0; i < response.data.length; i += 1)
    {
      var current = appnet.note.findChannelRefId(response.data[i]);
      if (! current) {
        var val = appnet.note.findAnnotation('net.app.core.channel.invite',
                                             response.data[i].annotations);
        if (val) {
          current = val.channel_id;
        }
      }
      if (current) {
        publicChannels.push(current);
      }
    }
    
    appnet.api.getAllChannelList(publicChannels, { include_annotations: 1 },
                                 processPublicChannels, failChannelList);
  }

  function processPublicChannels(response)
  {
    processUsers(response, $.proxy(processPublic, response));
  }

  var processPublic = function (response)
  {
    updateChannelUsers(response.data);

    sortChannels(this.data);
    var i = 0;
    var j = 0;
    var foundCat = false;
    var general = $('<div class="span8"/>');
    general.append('<h3>General Rooms</h3>');
    for (j = 0; j < cats.length; j += 1)
    {
      cats[j].tag = $('<div class="span8"/>');
      cats[j].tag.append('<h3>' + cats[j].title + '</h3>');
    }
    for (i = 0; i < this.data.length; i += 1)
    {
      foundCat = false;
      for (j = 0; j < cats.length; j += 1)
      {
        if (cats[j].match(this.data[i]))
        {
          foundCat = true;
          cats[j].tag.append(renderChannel(this.data[i]));
        }
      }
      if (! foundCat)
      {
        general.append(renderChannel(this.data[i]));
      }
    }
    for (j = 0; j < cats.length; j += 1)
    {
      cats[j].wrapper.html(cats[j].tag);
    }
    $('#general').html(general);
  };

  function processUsers(response, callback)
  {
    var users = [];
    var i = 0;
    for (i = 0; i < response.data.length; i += 1)
    {
      addUsers(response.data[i], users);
    }

    appnet.api.getAllUserList(users, {}, callback, failChannelList);
  }

  function addUsers(channel, users)
  {
    channelMembers[channel.owner.id] = channel.owner;
    for (var i = 0; i < channel.writers.user_ids.length; i += 1)
    {
      var id = channel.writers.user_ids[i];
      if (! channelMembers[id])
      {
        users.push(id);
      }
    }
  }

  function updateChannelUsers(users)
  {
    var i = 0;
    for (i = 0; i < users.length; i += 1)
    {
      channelMembers[users[i].id] = users[i];
    }
  }

//    gettingPublic = true;
//    channels = [];
//    appnet.api.getChannelList(publicChannels, { include_annotations: 1 },
//                              completeChannelList, failChannelList);
//  }
/*
  function processChannelList(minId)
  {
    var options = {
      include_annotations: 1,
      count: 200
    };
    if (minId)
    {
      options.before_id = minId;
    }
    appnet.api.getSubscriptions(options, completeChannelList, failChannelList);
  }

  function completeChannelList(response)
  {
    var minId = null;
    if (response.meta.more)
    {
      minId = response.meta.min_id;
    }
    channels = channels.concat(response.data);
    if (minId || gettingPublic)
    {
      gettingPublic = false;
      processChannelList(minId);
    }
    else
    {
      for (var i = 0; i < channels.length; i += 1) {
        channelMembers[channels[i].owner.id] = channels[i].owner;
        for (var j = 0; j < channels[i].writers.user_ids.length; j += 1)
        {
          var id = channels[i].writers.user_ids[j];
          if (channelMembers[id] === undefined) {
            channelMembers[id] = null;
          }
        }
      }
      getChannelMemberInfo();
    }
  }
*/
  function failChannelList(response)
  {
  }
/*
  function processPublicChannels()
  {
    var options = {
      include_annotations: 1,
      include_deleted: 0,
      count: 200
    };
    appnet.api.getMessages('1614', options, completePublicChannels, null);
  }

  function completePublicChannels(response)
  {
    publicChannels = ['1614'];
    lastPublic = response.meta.max_id;
    var i = 0;
    for (i = 0; i < response.data.length; i += 1)
    {
      var current = appnet.note.findChannelRefId(response.data[i]);
      if (! current) {
        var val = appnet.note.findAnnotation('net.app.core.channel.invite',
                                             response.data[i].annotations);
        if (val) {
          current = val.channel_id;
        }
      }
      if (current) {
        publicChannels.push(current);
      }
    }
    fetchEvent();
  }


  function getChannelMemberInfo() {
    var ids = Object.keys(channelMembers);
    var needed = [];
    var count = 0;
    var i = 0;
    for (i = 0; i < ids.length; i += 1) {
      if (! channelMembers[ids[i]])
      {
        needed.push(ids[i]);
        count += 1;
        if (count >= 200)
        {
          break;
        }
      }
    }
    if (count > 0) {
      appnet.api.getUserList(needed, null, function (response) {
        for (var i = 0; i < response.data.length; i += 1) {
          channelMembers[response.data[i].id] = response.data[i];
        }
        getChannelMemberInfo();
      }, null);
    }
    renderAllChannels();
  }

  function renderAllChannels()
  {
    var mine = $('<div/>').append('<h3 class="muted">My Rooms</h3>');
    var pm = $('<div/>').append('<h3 class="muted">Private Messages</h3>');
    var other = $('<div/>').append('<h3 class="muted">Public Rooms</h3>');
    var lastId = 0;
    var i = 0;
    for (i = 0; i < channels.length; i += 1) {
      if (channels[i].id === '1614') {
        mine = mine;
//        if (! channels[i].is_deleted &&
//            channels[i].recent_message_id  > lastPublic) {
//          processPublicChannels();
//        }
      } else if (channels[i].type === 'net.patter-app.room') {
        if (lastId !== channels[i].id) {
          if (channels[i].you_subscribed) {
            mine.append(renderChannel(channels[i]));
          } else {
            other.append(renderChannel(channels[i]));
          }
        }
      } else {
        pm.append(renderChannel(channels[i]));
      }
      lastId = channels[i].id;
    }
    $('#patter-list').html(mine.contents());
    $('#pm-list').html(pm.contents());
    $('#public-list').html(other.contents());
    if (! shownChannels) {
      //        $('#loading-modal').modal('hide');
      shownChannels = true;
    }
  }
*/
  function renderChannel(channel)
  {
    var result = null;
    if (channel.type === 'net.app.core.pm') {
      result = renderPmChannel(channel);
    } else if (channel.type === 'net.patter-app.room') {
      result = renderPatterChannel(channel);
    }
    return result;
  }
  
  function renderPmChannel(channel)
  {
    var row = $('<div/>');
    var members = findChannelMembers(channel);
    
    row.addClass('row-fluid');

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
    row.append($('<div class="span5"/>').append(renderMembers(members)));
    row.append($('<div class="span5"/>').append(renderThumbs(members)));
    row.append($('<div class="span2"/>').append(appnet.renderStatus(channel))
               .append('<br>')
               .append(timestamp));
    
    var result = $('<a class="btn btn-large btn-block" href="room.html?channel=' + channel.id + '">');
    if (channel.has_unread) {
      result.addClass('btn-success');
    }
    result.append(row);
    return result;
  }

  function renderPatterChannel(channel)
  {
    var row = $('<div/>');
    var members = findChannelMembers(channel);
    var settings = appnet.note.findPatterSettings(channel);
    
    row.addClass('row-fluid');
    
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
    row.append($('<div class="span4"/>').append(renderChannelName(channel)));
    if (settings.blurb)
    {
      row.append($('<div class="span6"/>').append(util.htmlEncode(settings.blurb)));
    }
    else
    {
      row.append($('<div class="span6"/>').append(renderThumbs(members)));
    }
               
    row.append($('<div class="span2"/>').append(appnet.renderStatus(channel))
               .append('<br>')
               .append(timestamp));
    
    var result = $('<a class="btn btn-large btn-block" href="room.html?channel=' + channel.id + '">');
    if (channel.has_unread) {
      result.addClass('btn-success');
    }
    result.append(row);
    return result;
  }
  
  function renderChannelName(channel)
  {
    return $('<h4>' + util.htmlEncode(appnet.note.findPatterName(channel)) + '</h4>');
  }

  function renderThumbs(members)
  {
    var result = $('<div/>');
    for (var i = 0; i < members.length; i += 1) {
      result.append('<img class="avatarImg img-rounded" ' +
                    'width="40" height="40" src="' +
                    members[i].avatar + '" alt=""/>');
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

  function findChannelMembers(channel)
  {
    var isPatter = (channel.type === 'net.patter-app.room');
    var members = [];
    if (channel.owner.id !== currentUser.id || isPatter) {
      members.push({ user: channel.owner.username,
                     avatar: channel.owner.avatar_image.url });
    }
    for (var i = 0; i < channel.writers.user_ids.length; i += 1)
    {
      var id = channel.writers.user_ids[i];
      if (channelMembers[id] &&
          (id !== currentUser.id || isPatter)) {
        members.push({user: channelMembers[id].username,
                      avatar: channelMembers[id].avatar_image.url});
      }
    }
    members.sort(function (left, right) {
      return left.user.localeCompare(right.user);
    });
    return members;
  }

  function initButtons() {
    editRoomModal.init();
    $('#create-patter-button').on('click', function (event) {
      event.preventDefault();
      editRoomModal.update(null, 'net.patter-app.room');
      editRoomModal.show();
      return false;
    });
    $('#create-pm-button').on('click', function (event) {
      event.preventDefault();
      editRoomModal.update(null, 'net.app.core.pm');
      editRoomModal.show();
      return false;
    });
    $('#logout-button').on('click', logout);
  }
  
  function logout(event)
  {
    event.preventDefault();
    delete localStorage.patter2Token;
    util.redirect('index.html');
    return false;
  }

  $(document).ready(initialize);
});

define("js/lobby", function(){});
