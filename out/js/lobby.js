
eval("// util.js\r\n//\r\n// General utility functions of use to any JavaScript project\r\n\r\n/*global define:true */\r\ndefine(\'js/util\',[\'jquery\'], function ($) {\r\n  \'use strict\';\r\n\r\n  var util = {};\r\n\r\n  util.redirect = function (dest)\r\n  {\r\n    window.location = dest;\r\n  };\r\n\r\n  util.getUrlVars = function ()\r\n  {\r\n    var vars = [], hash;\r\n    var hashes = window.location.href.slice(window.location.href.indexOf(\'?\') + 1).split(\'&\');\r\n    var i = 0;\r\n    for (i = 0; i < hashes.length; i += 1)\r\n    {\r\n      hash = hashes[i].split(\'=\');\r\n      vars.push(hash[0]);\r\n      vars[hash[0]] = hash[1];\r\n    }\r\n    return vars;\r\n  };\r\n\r\n  util.htmlEncode = function (value)\r\n  {\r\n    var result = \'\';\r\n    if (value) {\r\n      result = $(\'<div />\').text(value).html();\r\n    }\r\n    return result;\r\n  };\r\n\r\n  util.htmlDecode = function (value)\r\n  {\r\n    var result = \'\';\r\n    if (value) {\r\n      result = $(\'<div />\').html(value).text();\r\n    }\r\n    return result;\r\n  };\r\n\r\n\r\n  util.stripSpaces = function (str)\r\n  {\r\n    return str.replace(/ +$/g, \'\').replace(/^ +/g, \'\');\r\n  };\r\n\r\n  util.flagError = function (id, message)\r\n  {\r\n    var newAlert = \'<div class=\"alert alert-error\">\' +\r\n          \'<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\' +\r\n          \'<strong>Error:</strong> \' + message +\r\n          \'</div>\';\r\n    $(\'#\' + id).html(newAlert);\r\n  };\r\n\r\n  util.has_focus = true;\r\n  $(window).on(\'focus\', function () {\r\n    util.has_focus = true;\r\n  });\r\n  $(window).on(\'blur\', function () {\r\n    util.has_focus = false;\r\n  });\r\n\r\n  return util;\r\n});\r\n\n//@ sourceURL=/js/util.js");

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

eval("// appnet-api.js\r\n//\r\n// API calls on the app.net web service\r\n\r\n/*global define: true */\r\ndefine(\'js/appnet-api\',[\'jquery\', \'js/util\', \'jquery-cookie\'],\r\nfunction ($, util) {\r\n  \'use strict\';\r\n\r\n  var appnet = {};\r\n\r\n  var authCookie = \'patter2Token\';\r\n  var urlCookie = \'patterPrevUrl\';\r\n\r\n  appnet.accessToken = $.cookie(authCookie);\r\n    \r\n  var callSuccess = function (response)\r\n  {\r\n    if (response !== null &&\r\n\tresponse.meta !== undefined &&\r\n\tresponse.data !== undefined)\r\n    {\r\n      if (this.success)\r\n      {\r\n        this.success(response);\r\n      }\r\n    }\r\n    else\r\n    {\r\n      if (this.failure)\r\n      {\r\n        console.log(\'AppNet null response\');\r\n        console.dir(response);\r\n        this.failure(response.meta);\r\n      }\r\n    }\r\n  };\r\n\r\n  var callFailure = function (request, status, thrown)\r\n  {\r\n    console.log(\'AppNet call failed: \' + status + \', thrown: \' + thrown);\r\n    console.dir(request.responseText);\r\n    var meta = null;\r\n    if (request.responseText) {\r\n      var response = JSON.parse(request.responseText);\r\n      if (response !== null) {\r\n        meta = response.meta;\r\n      }\r\n    }\r\n    if (this.failure) {\r\n      this.failure(meta);\r\n    }\r\n  };\r\n\r\n  function makeArgs(args)\r\n  {\r\n    var result = \'\';\r\n    if (args)\r\n    {\r\n      result = $.param(args);\r\n    }\r\n    if (result !== \'\')\r\n    {\r\n      result = \'?\' + result;\r\n    }\r\n    return result;\r\n  }\r\n    \r\n  function makeData(data)\r\n  {\r\n    var result = null;\r\n    if (data)\r\n    {\r\n      result = JSON.stringify(data);\r\n    }\r\n    return result;\r\n  }\r\n  \r\n  function makeUrl(pieces)\r\n  {\r\n    var result = \'\';\r\n    var i = 0;\r\n    for (i = 0; i < pieces.length; i += 1)\r\n    {\r\n      if (pieces[i])\r\n      {\r\n        result += pieces[i];\r\n      }\r\n    }\r\n    return result;\r\n  }\r\n\r\n  function add(name, type, url)\r\n  {\r\n    appnet[name] = function (args, success, failure) {\r\n      this.call(url, type, args, success, failure);\r\n    };\r\n  }\r\n\r\n  function addOne(name, type, prefix, suffix)\r\n  {\r\n    appnet[name] = function (target, args, success, failure) {\r\n      var url = makeUrl([prefix, target, suffix]);\r\n      this.call(url, type, args, success, failure);\r\n    };\r\n  }\r\n    \r\n  function addTwo(name, type, prefix, middle, suffix)\r\n  {\r\n    appnet[name] = function (first, second, args, success, failure) {\r\n      var url = makeUrl([prefix, first, middle, second, suffix]);\r\n      this.call(url, type, args, success, failure);\r\n    };\r\n  }\r\n\r\n  function addList(name, type, url)\r\n  {\r\n    appnet[name] = function (list, argsIn, success, failure) {\r\n      var ids = list.join(\',\');\r\n      var args = { ids: ids};\r\n      $.extend(args, argsIn);\r\n      this.call(url, type, args, success, failure);\r\n    };\r\n  }\r\n\r\n  function addData(name, type, url)\r\n  {\r\n    appnet[name] = function (data, args, success, failure) {\r\n      this.call(url, type, args, success, failure, data);\r\n    };\r\n  }\r\n\r\n  function addDataOne(name, type, prefix, suffix)\r\n  {\r\n    appnet[name] = function (target, data, args, success, failure) {\r\n      var url = makeUrl([prefix, target, suffix]);\r\n      this.call(url, type, args, success, failure, data);\r\n    };\r\n  }\r\n\r\n  // ------------------------------------------------------------------------\r\n  // User\r\n  // ------------------------------------------------------------------------\r\n\r\n  // getUser(userId, args, success, failure);\r\n  addOne(\'getUser\', \'GET\',\r\n         \'https://alpha-api.app.net/stream/0/users/\');\r\n\r\n  // getUserList([userId1, userId2], args, success, failure);\r\n  addList(\'getUserList\', \'GET\',\r\n          \'https://alpha-api.app.net/stream/0/users\');\r\n\r\n  // updateUser(newUser, args, success, failure);\r\n  addData(\'updateUser\', \'PUT\',\r\n          \'https://alpha-api.app.net/stream/0/users/me\');\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Channel\r\n  // ------------------------------------------------------------------------\r\n\r\n  // createChannel\r\n  addData(\'createChannel\', \'POST\',\r\n          \'https://alpha-api.app.net/stream/0/channels\');\r\n\r\n  // getChannel(channelId, args, success, failure);\r\n  addOne(\'getChannel\', \'GET\',\r\n         \'https://alpha-api.app.net/stream/0/channels/\');\r\n\r\n  // getChannelList([channelId1, channelId2], args, success, failure);\r\n  addList(\'getChannelList\', \'GET\',\r\n          \'https://alpha-api.app.net/stream/0/channels/\');\r\n\r\n  // updateChannel(channelId, newChannel, args, success, failure);\r\n  addDataOne(\'updateChannel\', \'PUT\',\r\n             \'https://alpha-api.app.net/stream/0/channels/\');\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Message\r\n  // ------------------------------------------------------------------------\r\n\r\n  // getMessages(channelId, args, success, failure);\r\n  addOne(\'getMessages\', \'GET\',\r\n         \'https://alpha-api.app.net/stream/0/channels/\', \'/messages\');\r\n\r\n  // createMessage(channelId, newMessage, args, success, failure);\r\n  addDataOne(\'createMessage\', \'POST\',\r\n             \'https://alpha-api.app.net/stream/0/channels/\', \'/messages\');\r\n\r\n  // deleteMessage(messageId, args, success, failure);\r\n  addTwo(\'deleteMessage\', \'DELETE\',\r\n         \'https://alpha-api.app.net/stream/0/channels/\', \'/messages/\');\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Post\r\n  // ------------------------------------------------------------------------\r\n\r\n  // createPost(newPost, args, success, failure);\r\n  addData(\'createPost\', \'POST\',\r\n          \'https://alpha-api.app.net/stream/0/posts\');\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Subscription\r\n  // ------------------------------------------------------------------------\r\n\r\n  // getSubscriptions(args, success, failure);\r\n  add(\'getSubscriptions\', \'GET\',\r\n      \'https://alpha-api.app.net/stream/0/channels/\');\r\n\r\n  // createSubscription(channelId, args, success, failure);\r\n  addOne(\'createSubscription\', \'POST\',\r\n         \'https://alpha-api.app.net/stream/0/channels/\', \'/subscribe\');\r\n\r\n  // deleteSubscription(channelId, args, success, failure);\r\n  addOne(\'deleteSubscription\', \'DELETE\',\r\n         \'https://alpha-api.app.net/stream/0/channels/\', \'/subscribe\');\r\n\r\n  // ------------------------------------------------------------------------\r\n  // Marker\r\n  // ------------------------------------------------------------------------\r\n\r\n  // updateMarker(newMarker, args, success, failure);\r\n  addData(\'updateMarker\', \'POST\',\r\n          \'https://alpha-api.app.net/stream/0/posts/marker\');\r\n\r\n  appnet.authorize = function ()\r\n  {\r\n    $.cookie(urlCookie, window.location, { expires: 1, path: \'/\' });\r\n    util.redirect(\'auth.html\');\r\n  };\r\n  \r\n  appnet.call = function (url, type, args, success, failure, data)\r\n  {\r\n    var complete = {\r\n      success: success,\r\n      failure: failure\r\n    };\r\n    var options = {\r\n      contentType: \'application/json\',\r\n      dataType: \'json\',\r\n      type: type,\r\n      url: url + makeArgs(args)\r\n    };\r\n    if (this.accessToken !== null) {\r\n      options.headers = { Authorization: \'Bearer \' + this.accessToken };\r\n    }\r\n    if (data) {\r\n      options.data = makeData(data);\r\n    }\r\n    var header = $.ajax(options);\r\n    header.done($.proxy(callSuccess, complete));\r\n    header.fail($.proxy(callFailure, complete));\r\n  };\r\n  \r\n  return appnet;\r\n});\r\n\n//@ sourceURL=/js/appnet-api.js");

eval("// appnet-note.js\r\n//\r\n// Functions to create and process app.net annotations\r\n\r\n/*global define: true */\r\ndefine(\'js/appnet-note\',[\'js/util\'], function (util) {\r\n  \'use strict\';\r\n\r\n  var note = {};\r\n\r\n  note.findAnnotation = function (type, list)\r\n  {\r\n    var result = null;\r\n    var i = 0;\r\n    if (list)\r\n    {\r\n      for (i = 0; i < list.length; i += 1)\r\n      {\r\n        if (list[i].type === type)\r\n        {\r\n          result = list[i].value;\r\n          break;\r\n        }\r\n      }\r\n    }\r\n    return result;\r\n  };\r\n\r\n  note.findPatterSettings = function (channel)\r\n  {\r\n    var result = null;\r\n    if (channel)\r\n    {\r\n      result = note.findAnnotation(\'net.patter-app.settings\',\r\n                                   channel.annotations);\r\n    }\r\n    if (result === null)\r\n    {\r\n      result = {};\r\n    }\r\n    return result;\r\n  };\r\n\r\n  note.findPatterName = function (channel)\r\n  {\r\n    var name = null;\r\n    var settings = note.findAnnotation(\'net.patter-app.settings\',\r\n                                       channel.annotations);\r\n    if (settings !== null && settings.name !== undefined)\r\n    {\r\n      name = settings.name;\r\n    }\r\n    return name;\r\n  };\r\n\r\n  note.findChannelRefId = function (message)\r\n  {\r\n    var id = null;\r\n    if (message)\r\n    {\r\n      var ref = note.findAnnotation(\'net.view-app.channel-ref\',\r\n                                    message.annotations);\r\n      if (ref && ref.id)\r\n      {\r\n        id = ref.id;\r\n      }\r\n    }\r\n    return id;\r\n  };\r\n\r\n  note.broadcastNote = function (id, url) {\r\n    return {\r\n      type: \'net.patter-app.broadcast\',\r\n      value: {\r\n        id: id,\r\n        url: url\r\n      }\r\n    };\r\n  };\r\n\r\n  note.embedImageNote = function (url, widthIn, heightIn) {\r\n    var width = widthIn;\r\n    if (widthIn === null ||\r\n        widthIn === undefined)\r\n    {\r\n      width = 300;\r\n    }\r\n    var height = heightIn;\r\n    if (heightIn === null ||\r\n        heightIn === undefined)\r\n    {\r\n      height = 300;\r\n    }\r\n    return {\r\n      type: \'net.app.core.oembed\',\r\n      value: {\r\n        version: \'1.0\',\r\n        type: \'photo\',\r\n        width: width,\r\n        height: height,\r\n        url: util.stripSpaces(url)\r\n      }\r\n    };\r\n  };\r\n\r\n  note.channelRefNote = function (id, name, userId, type) {\r\n    return {\r\n      type: \'net.view-app.channel-ref\',\r\n      value: {\r\n        id: id,\r\n        label: name,\r\n        owner_id: userId,\r\n        type: type\r\n      }\r\n    };\r\n  };\r\n\r\n  return note;\r\n});\r\n\n//@ sourceURL=/js/appnet-note.js");

eval("// base.js\r\n//\r\n// Utility functions for dealing with app.net\r\n\r\n/*global define:true */\r\ndefine(\'js/appnet\',[\'jquery\', \'js/util\', \'js/appnet-api\', \'js/appnet-note\'],\r\nfunction ($, util, api, note) {\r\n  \'use strict\';\r\n\r\n  var appnet = {\r\n    api: api,\r\n    note: note,\r\n    user: null\r\n  };\r\n\r\n  appnet.isLogged = function () {\r\n    return this.api.accessToken !== null;\r\n  };\r\n\r\n  var updateUserSuccess = function (response) {\r\n    appnet.user = response.data;\r\n    if (this.success)\r\n    {\r\n      this.success(response);\r\n    }\r\n  };\r\n\r\n  var updateUserFailure = function (meta)\r\n  {\r\n    if (this.failure)\r\n    {\r\n      this.failure(meta);\r\n    }\r\n  };\r\n\r\n  appnet.updateUser = function (success, failure)\r\n  {\r\n    var complete = {\r\n      success: success,\r\n      failure: failure\r\n    };\r\n    api.getUser(\'me\', { \'include_annotations\': 1 },\r\n                   $.proxy(updateUserSuccess, complete),\r\n                   $.proxy(updateUserFailure, complete));\r\n  };\r\n\r\n\r\n  appnet.textToHtml = function (text, entitiesIn)\r\n  {\r\n    var result = $(\'<div/>\');\r\n    var entities = sortEntities(entitiesIn);\r\n    var anchor = 0;\r\n    var entity, link;\r\n    var i = 0;\r\n    for (i = 0; i < entities.length; i += 1) {\r\n      entity = entities[i].entity;\r\n      result.append(util.htmlEncode(text.substr(anchor, entity.pos - anchor)));\r\n      link = $(\'<a target=\"_blank\"/>\');\r\n      if (entities[i].type === \'mentions\')\r\n      {\r\n        link.addClass(\'mention\');\r\n        link.attr(\'href\',\r\n                  \'http://alpha.app.net/\' + util.htmlEncode(entity.name));\r\n        link.append(util.htmlEncode(\'@\' + entity.name));\r\n      }\r\n      else if (entities[i].type === \'hashtags\')\r\n      {\r\n        link.addClass(\'hashtag\');\r\n        link.attr(\'href\',\r\n                  \'http://alpha.app.net/hashtags/\' +\r\n                  util.htmlEncode(entity.name));\r\n        link.append(util.htmlEncode(\'#\' + entity.name));\r\n      }\r\n      else if (entities[i].type === \'links\')\r\n      {\r\n        link.addClass(\'link\');\r\n        link.attr(\'href\', entity.url);\r\n        link.append(util.htmlEncode(entity.text));\r\n      }\r\n      result.append(link);\r\n      anchor = entity.pos + entity.len;\r\n    }\r\n    result.append(util.htmlEncode(text.substr(anchor)));\r\n    return result;\r\n  };\r\n\r\n  function sortEntities(entities)\r\n  {\r\n    var result = [];\r\n    var typeList = [\'mentions\', \'hashtags\', \'links\'];\r\n    var i = 0;\r\n    var j = 0;\r\n    for (i = 0; i < typeList.length; i += 1)\r\n    {\r\n      var type = typeList[i];\r\n      for (j = 0; j < entities[type].length; j += 1)\r\n      {\r\n        result.push({pos: entities[type][j].pos,\r\n                     type: type,\r\n                     entity: entities[type][j]});\r\n      }\r\n    }\r\n    result.sort(function (left, right) {\r\n      return left.pos - right.pos;\r\n    });\r\n    return result;\r\n  }\r\n\r\n  appnet.renderStatus = function (channel)\r\n  {\r\n    var locked = (channel.readers.immutable && channel.writers.immutable);\r\n    var lockStatus = \'\';\r\n    if (locked) {\r\n      lockStatus = \'<i class=\"icon-lock\"></i> \';\r\n    }\r\n    var status = \'<span class=\"label\">\' + lockStatus + \'Private</span>\';\r\n    if (channel.readers[\'public\'] || channel.readers.any_user) {\r\n      status = \'<span class=\"label label-success\">\' + lockStatus +\r\n        \'Public Read</span>\';\r\n    }\r\n    if (channel.writers[\'public\'] || channel.writers.any_user) {\r\n      status = \'<span class=\"label label-success\">\' + lockStatus +\r\n        \'Public</span>\';\r\n    }\r\n    return status;\r\n  };\r\n\r\n  return appnet;\r\n});\r\n\n//@ sourceURL=/js/appnet.js");

eval("// roomInfo.js\n//\n// Information about the current room the user is chatting in.\n\n/*global define:true */\ndefine(\'js/roomInfo\',[\'jquery\', \'js/appnet\'], function ($, appnet) {\n  \'use strict\';\n\n  var roomInfo = {\n    id: null,\n    channel: null,\n    members: {},\n    changeCallback: null\n  };\n\n  roomInfo.updateChannel = function ()\n  {\n//    $(\'#loading-message\').html(\"Fetching Channel Information\");\n    appnet.api.getChannel(this.id, {include_annotations: 1},\n                          $.proxy(this.completeChannelInfo, this),\n                          $.proxy(failChannelInfo, this));\n  };\n\n  roomInfo.completeChannelInfo = function (response)\n  {\n    var owner = response.data.owner;\n    var keyList = Object.keys(this.members);\n    var i = 0;\n    this.channel = response.data;\n    for (i = 0; i < keyList.length; i += 1)\n    {\n      delete this.members[keyList[i]];\n    }\n    this.members[owner.username] = owner;\n    getWriterInfo();\n  };\n\n  var failChannelInfo = function (meta)\n  {\n    if (this.changeCallback)\n    {\n      this.changeCallback();\n    }\n  };\n\n  function getWriterInfo()\n  {\n    var ids = roomInfo.channel.writers.user_ids;\n    if (ids)\n    {\n      appnet.api.getUserList(ids, null, completeWriterInfo, failWriterInfo);\n    }\n    else if (roomInfo.changecallback)\n    {\n      roomInfo.changeCallback();\n    }\n  }\n\n  function completeWriterInfo(response)\n  {\n    var i = 0;\n    for (i = 0; i < response.data.length; i += 1)\n    {\n      roomInfo.members[response.data[i].username] = response.data[i];\n    }\n\n    if (roomInfo.changeCallback)\n    {\n      roomInfo.changeCallback();\n    }\n  }\n\n  function failWriterInfo(response)\n  {\n    if (roomInfo.changeCallback)\n    {\n      roomInfo.changeCallback();\n    }\n  }\n\n  return roomInfo;\n});\n\n//@ sourceURL=/js/roomInfo.js");

eval("// UserFields.js\n//\n// Expandable list of input fields which are validated against app.net\n\n/*global define:true */\ndefine(\'js/UserFields\',[\'jquery\', \'js/util\', \'js/appnet\'],\nfunction ($, util, appnet) {\n  \'use strict\';\n  function UserFields(prefix)\n  {\n    this.prefix = prefix;\n    this.moreDiv = $(\'#\' + prefix + \'-more-div\');\n    this.fieldCount = 0;\n    this.memberNames = {};\n    this.callback = null;\n    $(\'#\' + prefix + \'-more-button\').click($.proxy(this.clickMore, this));\n  }\n\n  UserFields.prototype.clickMore = function (event)\n  {\n    event.preventDefault();\n    this.addField();\n    return false;\n  };\n\n  // Create a new user name field\n  UserFields.prototype.addField = function (val)\n  {\n    var fieldset = $(\'<fieldset/>\');\n    var newItem = $(\'<div id=\"\' + this.prefix + \'-wrapper-\' +\n                    this.fieldCount +\n                    \'\" class=\"input-append control-group pull-left\"/>\');\n    newItem.append(\'<input id=\"\' + this.prefix + \'-input-\' + this.fieldCount +\n                   \'\" class=\"input\" type=\"text\" placeholder=\"@user\">\');\n    newItem.append(\'<button tabindex=\"-1\" id=\"\' + this.prefix + \'-remove-\' +\n                   this.fieldCount +\n                   \'\" class=\"btn btn-danger\"><i class=\"icon-remove\"></i></button>\');\n    fieldset.append(newItem);\n    this.moreDiv.before(fieldset);\n    if (val) {\n      $(\'#\' + this.prefix + \'-input-\' + this.fieldCount).val(val);\n    }\n    $(\'#\' + this.prefix + \'-remove-\' + this.fieldCount).on(\'click\', null, { index: this.fieldCount, obj: this }, function (event) {\n      event.preventDefault();\n      event.data.obj.removeField(event.data.index);\n      return false;\n    });\n    this.fieldCount += 1;\n  };\n\n  // Remove a new user name field\n  UserFields.prototype.removeField = function (index)\n  {\n    var i = 0;\n    if (index >= 0 && index < this.fieldCount) {\n      $(\'#\' + this.prefix + \'-wrapper-\' + index).remove();\n      var vals = [];\n      for (i = index + 1; i < this.fieldCount; i += 1)\n      {\n        vals.push($(\'#\' + this.prefix + \'-input-\' + i).val());\n        $(\'#\' + this.prefix + \'-wrapper-\' + i).remove();\n      }\n      this.fieldCount = index;\n      for (i = 0; i < vals.length; i += 1)\n      {\n        this.addField(vals[i]);\n      }\n    }\n  };\n\n  // Check validity of names, mark invalid names, then callback with a\n  // list of names or an empty list on failure.\n  UserFields.prototype.checkNames = function (callback)\n  {\n    this.callback = callback;\n    this.memberNames = {};\n    var foundName = false;\n    var i = 0;\n    for (i = 0; i < this.fieldCount; i += 1) {\n      var newName = $(\'#\' + this.prefix + \'-input-\' + i).val();\n      if (newName.substr(0, 1) !== \'@\')\n      {\n        newName = \'@\' + newName;\n      }\n      if (newName !== \'\' && newName !== \'@\')\n      {\n        this.memberNames[newName] = i;\n        foundName = true;\n      }\n    }\n    if (foundName)\n    {\n      appnet.api.getUserList(Object.keys(this.memberNames),\n                             { include_annotations: 1 },\n                             $.proxy(this.processNames, this),\n                             $.proxy(this.failNames, this));\n    }\n    else\n    {\n      this.callback([]);\n    }\n  };\n\n  UserFields.prototype.failNames = function (response)\n  {\n    util.flagError(this.prefix + \'-error-div\',\n                   \'Could not connect to app.net\');\n    if (this.callback)\n    {\n      this.callback(null);\n    }\n  };\n\n  UserFields.prototype.processNames = function (response)\n  {\n    var validNames = {};\n    var i = 0;\n    for (i = 0; i < response.data.length; i += 1)\n    {\n      validNames[\'@\' + response.data[i].username] = 1;\n    }\n    var keys = Object.keys(this.memberNames);\n    var allOk = true;\n    for (i = 0; i < keys.length; i += 1)\n    {\n      var index = this.memberNames[keys[i]];\n      $(\'#\' + this.prefix + \'-wrapper-\' + index).removeClass(\'error\');\n      if (validNames[keys[i]] === undefined)\n      {\n        allOk = false;\n        $(\'#\' + this.prefix + \'-wrapper-\' + index).addClass(\'error\');\n      }\n    }\n    var callbackArray = null;\n    if (allOk)\n    {\n      callbackArray = keys;\n    }\n    else\n    {\n      util.flagError(this.prefix + \'-error-div\',\n                     \'Fix Invalid Usernames\');\n    }\n    if (this.callback)\n    {\n      this.callback(callbackArray);\n    }\n  };\n\n  UserFields.prototype.hide = function ()\n  {\n    var i = 0;\n    $(\'#\' + this.prefix + \'-more-button\').hide();\n    $(\'#\' + this.prefix + \'-more-div\').hide();\n    for (i = 0; i < this.fieldCount; i += 1) {\n      $(\'#\' + this.prefix + \'-wrapper-\' + i).hide();\n    }\n  };\n\n  UserFields.prototype.show = function ()\n  {\n    var i = 0;\n    $(\'#\' + this.prefix + \'-more-button\').show();\n    $(\'#\' + this.prefix + \'-more-div\').show();\n    for (i = 0; i < this.fieldCount; i += 1) {\n      $(\'#\' + this.prefix + \'-wrapper-\' + i).show();\n    }\n  };\n\n  UserFields.prototype.disable = function ()\n  {\n    var i = 0;\n    $(\'#\' + this.prefix + \'-more-button\').hide();\n    for (i = 0; i < this.fieldCount; i += 1) {\n      $(\'#\' + this.prefix + \'-input-\' + i).attr(\'disabled\', true);\n      $(\'#\' + this.prefix + \'-remove-\' + i).hide();\n    }\n  };\n\n  UserFields.prototype.enable = function ()\n  {\n    var i = 0;\n    $(\'#\' + this.prefix + \'-more-button\').show();\n    for (i = 0; i < this.fieldCount; i += 1) {\n      $(\'#\' + this.prefix + \'-input-\' + i).attr(\'disabled\', false);\n      $(\'#\' + this.prefix + \'-remove-\' + i).show();\n    }\n  };\n\n  UserFields.prototype.reset = function ()\n  {\n    this.enable();\n    while (this.fieldCount > 0) {\n      this.removeField(this.fieldCount - 1);\n    }\n  };\n\n  return UserFields;\n});\n\n//@ sourceURL=/js/UserFields.js");

eval("/**\n * @license RequireJS text 2.0.3 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.\n * Available via the MIT or new BSD license.\n * see: http://github.com/requirejs/text for details\n */\n/*jslint regexp: true */\n/*global require: false, XMLHttpRequest: false, ActiveXObject: false,\n  define: false, window: false, process: false, Packages: false,\n  java: false, location: false */\n\ndefine(\'text\',[\'module\'], function (module) {\n    \'use strict\';\n\n    var text, fs,\n        progIds = [\'Msxml2.XMLHTTP\', \'Microsoft.XMLHTTP\', \'Msxml2.XMLHTTP.4.0\'],\n        xmlRegExp = /^\\s*<\\?xml(\\s)+version=[\\\'\\\"](\\d)*.(\\d)*[\\\'\\\"](\\s)*\\?>/im,\n        bodyRegExp = /<body[^>]*>\\s*([\\s\\S]+)\\s*<\\/body>/im,\n        hasLocation = typeof location !== \'undefined\' && location.href,\n        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\\:/, \'\'),\n        defaultHostName = hasLocation && location.hostname,\n        defaultPort = hasLocation && (location.port || undefined),\n        buildMap = [],\n        masterConfig = (module.config && module.config()) || {};\n\n    text = {\n        version: \'2.0.3\',\n\n        strip: function (content) {\n            //Strips <?xml ...?> declarations so that external SVG and XML\n            //documents can be added to a document without worry. Also, if the string\n            //is an HTML document, only the part inside the body tag is returned.\n            if (content) {\n                content = content.replace(xmlRegExp, \"\");\n                var matches = content.match(bodyRegExp);\n                if (matches) {\n                    content = matches[1];\n                }\n            } else {\n                content = \"\";\n            }\n            return content;\n        },\n\n        jsEscape: function (content) {\n            return content.replace(/([\'\\\\])/g, \'\\\\$1\')\n                .replace(/[\\f]/g, \"\\\\f\")\n                .replace(/[\\b]/g, \"\\\\b\")\n                .replace(/[\\n]/g, \"\\\\n\")\n                .replace(/[\\t]/g, \"\\\\t\")\n                .replace(/[\\r]/g, \"\\\\r\")\n                .replace(/[\\u2028]/g, \"\\\\u2028\")\n                .replace(/[\\u2029]/g, \"\\\\u2029\");\n        },\n\n        createXhr: masterConfig.createXhr || function () {\n            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.\n            var xhr, i, progId;\n            if (typeof XMLHttpRequest !== \"undefined\") {\n                return new XMLHttpRequest();\n            } else if (typeof ActiveXObject !== \"undefined\") {\n                for (i = 0; i < 3; i++) {\n                    progId = progIds[i];\n                    try {\n                        xhr = new ActiveXObject(progId);\n                    } catch (e) {}\n\n                    if (xhr) {\n                        progIds = [progId];  // so faster next time\n                        break;\n                    }\n                }\n            }\n\n            return xhr;\n        },\n\n        /**\n         * Parses a resource name into its component parts. Resource names\n         * look like: module/name.ext!strip, where the !strip part is\n         * optional.\n         * @param {String} name the resource name\n         * @returns {Object} with properties \"moduleName\", \"ext\" and \"strip\"\n         * where strip is a boolean.\n         */\n        parseName: function (name) {\n            var strip = false, index = name.indexOf(\".\"),\n                modName = name.substring(0, index),\n                ext = name.substring(index + 1, name.length);\n\n            index = ext.indexOf(\"!\");\n            if (index !== -1) {\n                //Pull off the strip arg.\n                strip = ext.substring(index + 1, ext.length);\n                strip = strip === \"strip\";\n                ext = ext.substring(0, index);\n            }\n\n            return {\n                moduleName: modName,\n                ext: ext,\n                strip: strip\n            };\n        },\n\n        xdRegExp: /^((\\w+)\\:)?\\/\\/([^\\/\\\\]+)/,\n\n        /**\n         * Is an URL on another domain. Only works for browser use, returns\n         * false in non-browser environments. Only used to know if an\n         * optimized .js version of a text resource should be loaded\n         * instead.\n         * @param {String} url\n         * @returns Boolean\n         */\n        useXhr: function (url, protocol, hostname, port) {\n            var uProtocol, uHostName, uPort,\n                match = text.xdRegExp.exec(url);\n            if (!match) {\n                return true;\n            }\n            uProtocol = match[2];\n            uHostName = match[3];\n\n            uHostName = uHostName.split(\':\');\n            uPort = uHostName[1];\n            uHostName = uHostName[0];\n\n            return (!uProtocol || uProtocol === protocol) &&\n                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&\n                   ((!uPort && !uHostName) || uPort === port);\n        },\n\n        finishLoad: function (name, strip, content, onLoad) {\n            content = strip ? text.strip(content) : content;\n            if (masterConfig.isBuild) {\n                buildMap[name] = content;\n            }\n            onLoad(content);\n        },\n\n        load: function (name, req, onLoad, config) {\n            //Name has format: some.module.filext!strip\n            //The strip part is optional.\n            //if strip is present, then that means only get the string contents\n            //inside a body tag in an HTML string. For XML/SVG content it means\n            //removing the <?xml ...?> declarations so the content can be inserted\n            //into the current doc without problems.\n\n            // Do not bother with the work if a build and text will\n            // not be inlined.\n            if (config.isBuild && !config.inlineText) {\n                onLoad();\n                return;\n            }\n\n            masterConfig.isBuild = config.isBuild;\n\n            var parsed = text.parseName(name),\n                nonStripName = parsed.moduleName + \'.\' + parsed.ext,\n                url = req.toUrl(nonStripName),\n                useXhr = (masterConfig.useXhr) ||\n                         text.useXhr;\n\n            //Load the text. Use XHR if possible and in a browser.\n            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {\n                text.get(url, function (content) {\n                    text.finishLoad(name, parsed.strip, content, onLoad);\n                }, function (err) {\n                    if (onLoad.error) {\n                        onLoad.error(err);\n                    }\n                });\n            } else {\n                //Need to fetch the resource across domains. Assume\n                //the resource has been optimized into a JS module. Fetch\n                //by the module name + extension, but do not include the\n                //!strip part to avoid file system issues.\n                req([nonStripName], function (content) {\n                    text.finishLoad(parsed.moduleName + \'.\' + parsed.ext,\n                                    parsed.strip, content, onLoad);\n                });\n            }\n        },\n\n        write: function (pluginName, moduleName, write, config) {\n            if (buildMap.hasOwnProperty(moduleName)) {\n                var content = text.jsEscape(buildMap[moduleName]);\n                write.asModule(pluginName + \"!\" + moduleName,\n                               \"define(function () { return \'\" +\n                                   content +\n                               \"\';});\\n\");\n            }\n        },\n\n        writeFile: function (pluginName, moduleName, req, write, config) {\n            var parsed = text.parseName(moduleName),\n                nonStripName = parsed.moduleName + \'.\' + parsed.ext,\n                //Use a \'.js\' file name so that it indicates it is a\n                //script that can be loaded across domains.\n                fileName = req.toUrl(parsed.moduleName + \'.\' +\n                                     parsed.ext) + \'.js\';\n\n            //Leverage own load() method to load plugin value, but only\n            //write out values that do not have the strip argument,\n            //to avoid any potential issues with ! in file names.\n            text.load(nonStripName, req, function (value) {\n                //Use own write() method to construct full module value.\n                //But need to create shell that translates writeFile\'s\n                //write() to the right interface.\n                var textWrite = function (contents) {\n                    return write(fileName, contents);\n                };\n                textWrite.asModule = function (moduleName, contents) {\n                    return write.asModule(moduleName, fileName, contents);\n                };\n\n                text.write(pluginName, nonStripName, textWrite, config);\n            }, config);\n        }\n    };\n\n    if (masterConfig.env === \'node\' || (!masterConfig.env &&\n            typeof process !== \"undefined\" &&\n            process.versions &&\n            !!process.versions.node)) {\n        //Using special require.nodeRequire, something added by r.js.\n        fs = require.nodeRequire(\'fs\');\n\n        text.get = function (url, callback) {\n            var file = fs.readFileSync(url, \'utf8\');\n            //Remove BOM (Byte Mark Order) from utf8 files if it is there.\n            if (file.indexOf(\'\\uFEFF\') === 0) {\n                file = file.substring(1);\n            }\n            callback(file);\n        };\n    } else if (masterConfig.env === \'xhr\' || (!masterConfig.env &&\n            text.createXhr())) {\n        text.get = function (url, callback, errback) {\n            var xhr = text.createXhr();\n            xhr.open(\'GET\', url, true);\n\n            //Allow overrides specified in config\n            if (masterConfig.onXhr) {\n                masterConfig.onXhr(xhr, url);\n            }\n\n            xhr.onreadystatechange = function (evt) {\n                var status, err;\n                //Do not explicitly handle errors, those should be\n                //visible via console output in the browser.\n                if (xhr.readyState === 4) {\n                    status = xhr.status;\n                    if (status > 399 && status < 600) {\n                        //An http 4xx or 5xx error. Signal an error.\n                        err = new Error(url + \' HTTP status: \' + status);\n                        err.xhr = xhr;\n                        errback(err);\n                    } else {\n                        callback(xhr.responseText);\n                    }\n                }\n            };\n            xhr.send(null);\n        };\n    } else if (masterConfig.env === \'rhino\' || (!masterConfig.env &&\n            typeof Packages !== \'undefined\' && typeof java !== \'undefined\')) {\n        //Why Java, why is this so awkward?\n        text.get = function (url, callback) {\n            var stringBuffer, line,\n                encoding = \"utf-8\",\n                file = new java.io.File(url),\n                lineSeparator = java.lang.System.getProperty(\"line.separator\"),\n                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),\n                content = \'\';\n            try {\n                stringBuffer = new java.lang.StringBuffer();\n                line = input.readLine();\n\n                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324\n                // http://www.unicode.org/faq/utf_bom.html\n\n                // Note that when we use utf-8, the BOM should appear as \"EF BB BF\", but it doesn\'t due to this bug in the JDK:\n                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058\n                if (line && line.length() && line.charAt(0) === 0xfeff) {\n                    // Eat the BOM, since we\'ve already found the encoding on this file,\n                    // and we plan to concatenating this buffer with others; the BOM should\n                    // only appear at the top of a file.\n                    line = line.substring(1);\n                }\n\n                stringBuffer.append(line);\n\n                while ((line = input.readLine()) !== null) {\n                    stringBuffer.append(lineSeparator);\n                    stringBuffer.append(line);\n                }\n                //Make sure we return a JavaScript string and not a Java string.\n                content = String(stringBuffer.toString()); //String\n            } finally {\n                input.close();\n            }\n            callback(content);\n        };\n    }\n\n    return text;\n});\n\n//@ sourceURL=/text.js");

eval("define(\'text!template/editRoomModal.html\',[],function () { return \'<div id=\"edit-room-modal\" class=\"modal hide fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"editRoomModalLabel\" aria-hidden=\"true\">\\r\\n  <div class=\"modal-header\">\\r\\n    <button id=\"edit-room-x\" type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">&times;</button>\\r\\n    <h3 id=\"edit-room-type\">Edit Room</h3>\\r\\n    <h4 id=\"edit-room-owner\">Owned by @user</h4>\\r\\n  </div>\\r\\n  <div class=\"modal-body\">\\r\\n    <p id=\"edit-room-body\">Main body text</p>\\r\\n    <form id=\"edit-room-form\">\\r\\n      <fieldset>\\r\\n        <input type=\"text\" placeholder=\"Name\" id=\"edit-room-name\">\\r\\n      </fieldset>\\r\\n      <fieldset>\\r\\n        <textarea id=\"edit-room-text\" class=\"input-xlarge\"\\r\\n                  rows=\"3\" maxlength=\"256\"\\r\\n                  placeholder=\"Private Message...\"></textarea>\\r\\n      </fieldset>\\r\\n      <fieldset>\\r\\n        <select id=\"edit-room-perm\" class=\"input-medium\">\\r\\n          <option value=\"private\">Private</option>\\r\\n          <option value=\"public\">Public</option>\\r\\n          <option value=\"public-read\">Public Read</option>\\r\\n        </select>\\r\\n        <label id=\"edit-room-perm-label\"></label>\\r\\n      </fieldset>\\r\\n      <fieldset id=\"edit-room-promote-wrapper\">\\r\\n        <label class=\"checkbox\">\\r\\n          <input type=\"checkbox\" id=\"edit-room-promote\">Show this room in the Patter Directory</input>\\r\\n        </label>\\r\\n        <textarea id=\"edit-room-promo-text\" class=\"input-xlarge\"\\r\\n                  rows=\"3\" maxlength=\"256\"\\r\\n                  placeholder=\"Describe Your Room...\"></textarea>\\r\\n      </fieldset>\\r\\n      <div class=\"row-fluid\">\\r\\n        <div class=\"span6\">\\r\\n          <div id=\"edit-room-more-div\" style=\"clear: both;\"></div>\\r\\n        </div>\\r\\n        <div class=\"span1\">\\r\\n          <button class=\"btn btn-success\" id=\"edit-room-more-button\"><i class=\"icon-plus\"></i></button>\\r\\n        </div>\\r\\n      </div>\\r\\n      <div id=\"edit-room-error-div\"></div>\\r\\n    </form>\\r\\n  </div>\\r\\n  <div class=\"modal-footer\">\\r\\n    <button id=\"edit-room-cancel\" class=\"btn\" data-dismiss=\"modal\" aria-hidden=\"true\">Cancel</button>\\r\\n    <button id=\"edit-room-save\" data-dismiss=\"modal\" data-loading-text=\"Saving...\" class=\"btn btn-primary\">Save</button>\\r\\n  </div>\\r\\n</div>\\r\\n\';});\n\n//@ sourceURL=/text!template/editRoomModal.html");

eval("// editRoomModal.js\n//\n// A dialog box for editing or viewing the properties of the current\n// room. This may also be used as a dialog for creating a new room.\n\n/*global define:true */\ndefine(\'js/editRoomModal\',[\'jquery\', \'js/util\', \'js/appnet\', \'js/roomInfo\',\n        \'js/UserFields\',\n        \'text!template/editRoomModal.html\'],\nfunction ($, util, appnet, roomInfo, UserFields, editTemplate) {\n  \'use strict\';\n\n  var editRoomModal = {\n  };\n\n  var editRoomFields = null;\n  var editRoomChannel = null;\n  var editRoomType = null;\n\n  editRoomModal.init = function ()\n  {\n    $(\'#modal-container\').append(editTemplate);\n    editRoomFields = new UserFields(\'edit-room\');\n    $(\'#edit-room-save\').click(clickSave);\n    $(\'#edit-room-perm\').on(\'change\', function (event) {\n      updatePatterPerm();\n    });\n    $(\'#edit-room-promote\').on(\'change\', function (event) {\n      updatePatterPerm();\n    });\n    $(\'#edit-room-form\').on(\'submit\', function (event) {\n      event.preventDefault();\n      $(\'#edit-room-save\').click();\n      return false;\n    });\n  };\n\n  editRoomModal.show = function ()\n  {\n    $(\'#edit-room-modal\').modal();\n  };\n\n  editRoomModal.canEditChannel = function (channel) {\n    return channel.you_can_edit &&\n      (channel.type === \'net.patter-app.room\' ||\n       ! channel.writers.immutable ||\n       ! channel.readers.immutable);\n  };\n\n  editRoomModal.update = function (newChannel, newType)\n  {\n    editRoomChannel = newChannel;\n    editRoomType = newType;\n    var canEdit = true;\n    if (editRoomChannel !== null) {\n      canEdit = this.canEditChannel(editRoomChannel);\n      editRoomType = editRoomChannel.type;\n    }\n    var settings = appnet.note.findPatterSettings(editRoomChannel);\n\n    // Modal Title\n    var roomType = \'Create \';\n    if (editRoomChannel !== null && canEdit) {\n      roomType = \'Edit \';\n    } else if (editRoomChannel !== null) {\n      roomType = \'View \';\n    }\n    if (editRoomType === \'net.patter-app.room\') {\n      roomType += \'Patter Room\';\n    } else if (editRoomType === \'net.app.core.pm\') {\n      roomType += \'PM Channel\';\n    }\n    $(\'#edit-room-type\').html(roomType);\n    \n    // Modal subtitle\n    var ownerText = \'\';\n    if (editRoomChannel !== null) {\n      ownerText = \'Owned by @\' + editRoomChannel.owner.username;\n    }\n    $(\'#edit-room-owner\').html(ownerText);\n    \n    $(\'#edit-room-body\').hide();\n    if (editRoomChannel === null) {\n      if (editRoomType === \'net.patter-app.room\') {\n        $(\'#edit-room-body\').html(\'Patter rooms may be public or private and the owner can modify permissions after they are created.\');\n        $(\'#edit-room-body\').show();\n      } else if (editRoomType === \'net.app.core.pm\') {\n        $(\'#edit-room-body\').html(\'Private message channels are always private, and you cannot change their permissions.\');\n        $(\'#edit-room-body\').show();\n      }\n    }\n\n    // Set name field\n    if (editRoomType === \'net.patter-app.room\') {\n      $(\'#edit-room-name\').show();\n    } else {\n      $(\'#edit-room-name\').hide();\n    }\n    \n    $(\'#edit-room-text\').val(\'\');\n    if (editRoomChannel === null && editRoomType === \'net.app.core.pm\') {\n      $(\'#edit-room-text\').show();\n    } else {\n      $(\'#edit-room-text\').hide();\n    }\n\n    $(\'#edit-room-perm\').removeAttr(\'disabled\');\n    if (editRoomType === \'net.app.core.pm\') {\n      $(\'#edit-room-perm\').attr(\'disabled\', true);\n      $(\'#edit-room-perm\').val(\'private\');\n    } else if (editRoomChannel !== null &&\n               (editRoomChannel.writers[\'public\'] ||\n                editRoomChannel.writers.any_user)) {\n      $(\'#edit-room-perm\').val(\'public\');\n    } else if (editRoomChannel !== null &&\n               (editRoomChannel.readers[\'public\'] ||\n                editRoomChannel.readers.any_user)) {\n      $(\'#edit-room-perm\').val(\'public-read\');\n    } else {\n      $(\'#edit-room-perm\').val(\'private\');\n    }\n\n    if (settings.name)\n    {\n      $(\'#edit-room-name\').val(settings.name);\n    }\n    else\n    {\n      $(\'#edit-room-name\').val(\'\');\n    }\n\n    if (settings.blurb && settings.blurb_id)\n    {\n      $(\'#edit-room-promo-text\').val(settings.blurb);\n      $(\'#edit-room-promote\').attr(\'checked\', \'checked\');\n    }\n    else\n    {\n      $(\'#edit-room-promo-text\').val(\'\');\n      $(\'#edit-room-promote\').removeAttr(\'checked\');\n    }\n\n    editRoomFields.reset();\n    if (editRoomChannel !== null)\n    {\n      var keys = Object.keys(roomInfo.members);\n      var i = 0;\n      for (i = 0; i < keys.length; i += 1) {\n        editRoomFields.addField(\'@\' + keys[i]);\n      }\n    }\n    if (canEdit) {\n      editRoomFields.addField();\n    }\n    if (canEdit) {\n      $(\'#edit-room-save\').show();\n      $(\'#edit-room-cancel\').html(\'Cancel\');\n      if (editRoomChannel !== null && editRoomChannel.writers.immutable) {\n        $(\'#edit-room-perm\').attr(\'disabled\', true);\n        editRoomFields.disable();\n      } else {\n        editRoomFields.enable();\n      }\n      if (editRoomChannel !== null && editRoomChannel.readers.immutable) {\n        $(\'#edit-room-perm\').attr(\'disabled\', true);\n      }\n    } else {\n      $(\'#edit-room-save\').hide();\n      $(\'#edit-room-cancel\').html(\'Back\');\n      $(\'#edit-room-name\').attr(\'disabled\', true);\n      $(\'#edit-room-perm\').attr(\'disabled\', true);\n      editRoomFields.disable();\n    }\n    if (editRoomChannel === null)\n    {\n      $(\'#edit-room-save\').html(\'Create\');\n    }\n    else\n    {\n      $(\'#edit-room-save\').html(\'Save\');\n    }\n    $(\'#edit-room-error-div\').html(\'\');\n    updatePatterPerm();\n  };\n\n  function completeEditRoom(names) {\n    var settings = appnet.note.findPatterSettings(editRoomChannel);\n    if (names && names.length === 0 &&\n        editRoomType === \'net.app.core.pm\') {\n      util.flagError(\'pm-create-fields-error-div\', \'You need at least one recipient\');\n    } else if (names) {\n      if (editRoomType === \'net.app.core.pm\') {\n        createPmChannel(names);\n      } else {\n        if (getPromo() === \'\' || settings.blurb_id) {\n          if (editRoomChannel === null) {\n            createPatterChannel(names);\n          } else {\n            changePatterChannel(editRoomChannel, names);\n          }\n        } else {\n          createBlurb(editRoomChannel, names);\n        }\n      }\n      $(\'#edit-room-modal\').modal(\'hide\');\n    }\n    enableEditRoom();\n  }\n\n  function disableEditRoom() {\n    $(\'#edit-room-x\').attr(\'disabled\', true);\n    $(\'#edit-room-name\').attr(\'disabled\', true);\n    $(\'#edit-room-text\').attr(\'disabled\', true);\n    $(\'#edit-room-perm\').attr(\'disabled\', true);\n    $(\'#edit-room-cancel\').attr(\'disabled\', true);\n    $(\'#edit-room-save\').button(\'loading\');\n    editRoomFields.disable();\n  }\n\n  function enableEditRoom() {\n    $(\'#edit-room-x\').removeAttr(\'disabled\');\n    $(\'#edit-room-name\').removeAttr(\'disabled\');\n    $(\'#edit-room-text\').removeAttr(\'disabled\');\n    $(\'#edit-room-perm\').removeAttr(\'disabled\');\n    $(\'#edit-room-cancel\').removeAttr(\'disabled\');\n    $(\'#edit-room-save\').button(\'reset\');\n    editRoomFields.enable();\n  }\n\n  function makeNewChannel(name, perm, promo, blurbId, members, oldChannel) {\n    var channel = { auto_subscribe: true };\n    if (! oldChannel || ! oldChannel.writers.immutable) {\n      var canWrite = (perm === \'public\');\n      var writers = {\n        immutable: false,\n        any_user: canWrite\n      };\n      if (! canWrite)\n      {\n        writers.user_ids = members;\n      }\n      channel.writers = writers;\n    }\n    if (! oldChannel || ! oldChannel.readers.immutable) {\n      var canRead = (perm === \'public\' || perm === \'public-read\');\n      var readers = {\n        immutable: false,\n        \'public\': canRead\n      };\n      channel.readers = readers;\n    }\n    if (! oldChannel || oldChannel.type === \'net.patter-app.room\') {\n      var settings = appnet.note.findPatterSettings(oldChannel);\n      var annotation = { type: \'net.patter-app.settings\',\n                         value: { name: name } };\n      if (promo === \'\' && settings.blurb_id) {\n        appnet.api.deleteMessage(\'1614\', settings.blurb_id,\n                                 null, null, null);\n      } else if (promo !== \'\' && ! blurbId && settings.blurb_id) {\n        blurbId = settings.blurb_id;\n      }\n      if (blurbId) {\n        annotation.value.blurb_id = blurbId;\n        annotation.value.blurb = promo;\n      }\n      channel.annotations = [ annotation ];\n    }\n    return channel;\n  }\n\n  function updatePatterPerm() {\n    var perm = $(\'#edit-room-perm\');\n    var label = $(\'#edit-room-perm-label\');\n    var pwrapper = $(\'#edit-room-promote-wrapper\');\n    var pbox = $(\'#edit-room-promote\');\n    var ptext = $(\'#edit-room-promo-text\');\n    var fields = editRoomFields;\n\n    if (perm.val() === \'private\' ||\n        editRoomChannel === null ||\n        (editRoomChannel !== null &&\n         ! editRoomModal.canEditChannel(editRoomChannel))) {\n      pwrapper.hide();\n    } else {\n      pwrapper.show();\n    }\n\n    if (pbox.attr(\'checked\')) {\n      ptext.show();\n    } else {\n      ptext.hide();\n    }\n\n    if (perm.val() === \'public\') {\n      fields.hide();\n    } else {\n      fields.show();\n    }\n    if (perm.val() === \'private\') {\n      label.html(\'This room is private and only accessible by its members.\');\n    } else if (perm.val() === \'public\') {\n      label.html(\'This room is public and anyone may join or view it.\');\n    } else if (perm.val() === \'public-read\') {\n      label.html(\'Only members may participate, but anyone may view this room.\');\n    }\n  }\n\n  function getPromo()\n  {\n    var promo = \'\';\n    if ($(\'#edit-room-promote\').attr(\'checked\'))\n    {\n      promo = $(\'#edit-room-promo-text\').val();\n    }\n    return promo;\n  }\n\n  function changePatterChannel(oldChannel, names, blurbId) {\n    if (names)\n    {\n      var channel = makeNewChannel($(\'#edit-room-name\').val(),\n                                   $(\'#edit-room-perm\').val(),\n                                   getPromo(),\n                                   blurbId, names, oldChannel);\n      appnet.api.updateChannel(roomInfo.id, channel, {include_annotations: 1},\n                               $.proxy(roomInfo.completeChannelInfo, roomInfo),\n                               null);\n      $(\'#edit-room-modal\').modal(\'hide\');\n    }\n    enableEditRoom();\n  }\n\n  function createPmChannel(names)\n  {\n    var text = $(\'#edit-room-text\').val();\n    var message = { text: text,\n                    destinations: names };\n    appnet.api.createMessage(\'pm\', message, { include_annotations: 1 },\n                             completeCreatePm, failCreatePm);\n  }\n\n  function completeCreatePm(response)\n  {\n    util.redirect(\'room.html?channel=\' + response.data.channel_id);\n  }\n\n  function failCreatePm(meta)\n  {\n    util.flagError(\'edit-room-error-div\', \'Create PM Request Failed\');\n  }\n\n  function createBlurb(channel, names)\n  {\n    var name = $(\'#edit-room-name\').val();\n    var context = {\n      channel: channel,\n      names: names\n    };\n    var message = {\n      text: getPromo(),\n      annotations: [ appnet.note.channelRefNote(editRoomChannel.id, name,\n                                                appnet.user.id,\n                                                editRoomChannel.type) ]\n    };\n    appnet.api.createMessage(\'1614\', message, null,\n                             $.proxy(completeBlurb, context),\n                             failCreatePatter);\n  }\n\n  var completeBlurb = function (response)\n  {\n    if (this.channel) {\n      changePatterChannel(this.channel, this.names, response.data.id);\n    } else {\n      createPatterChannel(this.names, response.data.id);\n    }\n  };\n\n  function createPatterChannel(names, blurbId)\n  {\n    var channel = makeNewChannel($(\'#edit-room-name\').val(),\n                                 $(\'#edit-room-perm\').val(),\n                                 getPromo(),\n                                 blurbId, names);\n    channel.type = \'net.patter-app.room\';\n    appnet.api.createChannel(channel, { include_annotations: 1 },\n                             completeCreatePatter, failCreatePatter);\n  }\n\n  function completeCreatePatter(response)\n  {\n    util.redirect(\'room.html?channel=\' + response.data.id);\n  }\n\n  function failCreatePatter(meta)\n  {\n    util.flagError(\'edit-room-error-div\', \'Create Patter Room Request Failed\');\n  }\n\n  function clickSave(event) {\n    event.preventDefault();\n    if ($(\'#edit-room-name\').val() === \'\' &&\n        editRoomType === \'net.patter-app.room\') {\n      util.flagError(\'edit-room-error-div\', \'You must specify a name\');\n    } else if ($(\'#edit-room-text\').val() === \'\' &&\n               editRoomType === \'net.app.core.pm\') {\n      util.flagError(\'edit-room-error-div\', \'You must compose a message\');\n    } else {\n      disableEditRoom();\n      editRoomFields.checkNames(completeEditRoom);\n    }\n    return false;\n  }\n\n  return editRoomModal;\n});\n\n//@ sourceURL=/js/editRoomModal.js");

// lobby.js
//
// Overall task for managing a list of subscribed channels

/*global require: true */
require(['jquery', 'js/util', 'js/appnet', 'js/editRoomModal'],
function ($, util, appnet, editRoomModal) {
  

  var currentUser = null;
  var recentPostId = {};
  var hasNotified = false;

  function initialize() {
    if (! appnet.isLogged())
    {
      util.redirect('auth.html');
    }

//    $("#main-fail").hide();
//    $("#loading-modal").modal({backdrop: 'static',
//      keyboard: false});
    initButtons();
    appnet.updateUser(completeUserInfo, null);
  }

  function completeUserInfo(response) {
    currentUser = response.data;
//    $('#loading-message').html("Fetching Channels");
    processPublicChannels();
  }

  var publicChannels = [];
  var lastPublic = 0;
  var processChannelTimer = null;
  var channels = [];
  var shownChannels = false;
  var gettingPublic = true;

  function fetchEvent()
  {
    clearTimeout(processChannelTimer);
    processChannelTimer = setTimeout(fetchEvent, 45 * 1000);
    gettingPublic = true;
    channels = [];
    appnet.api.getChannelList(publicChannels, { include_annotations: 1 },
                              completeChannelList, failChannelList);
  }

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

  function failChannelList(response)
  {
  }

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
      if (current) {
        publicChannels.push(current);
      }
    }
    fetchEvent();
  }

  var channelMembers = {};

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
    channels.sort(function (left, right) {
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

    var mine = $('<div/>');
    var pm = $('<div/>');
    var other = $('<div/>');
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
    $('#patter-list .lobby-list-inner').html(mine.contents());
    $('#pm-list .lobby-list-inner').html(pm.contents());
    $('#public-list .lobby-list-inner').html(other.contents());
    if (! shownChannels) {
      //        $('#loading-modal').modal('hide');
      shownChannels = true;
    }
  }

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
    
    row.append($('<div class="users"/>').append(renderMembers(members)));
    row.append($('<div class="user-pics"/>').append(renderThumbs(members)));
    
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
    
    row.append($('<div class="channel-name"/>').append(renderChannelName(channel)));
    if (settings.blurb)
    {
      row.append($('<div class="span5"/>').append(util.htmlEncode(settings.blurb)));
    }
    else
    {
      row.append($('<div class="span5"/>').append(renderThumbs(members)));
    }
    row.append($('<div class="span2"/>').append(appnet.renderStatus(channel)));
    
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
                    'width="30" height="30" src="' +
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
    $.removeCookie('patter2Token');
    util.redirect('index.html');
    return false;
  }

  $(document).ready(initialize);
});

define("js/lobby", function(){});
