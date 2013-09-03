// UserList.js
//
// A pane showing a scrollable list of recent users and members

/*global define:true */
define(['jquery', 'underscore', 'util', 'appnet',
        'js/deps/text!template/user.html'],
function ($, _, util, appnet, userString) {
  'use strict';

  var userTemplate = _.template(userString);

  function UserList(root, userCallback)
  {
    this.root = root;
    this.userCallback = userCallback;
    this.members = {};
    this.postTimes = {};
    this.avatars = {};
    this.myUser = null;
  }

  var timeout = {
    // Times in minutes;
    idle: 10
  };

  UserList.prototype.updatePosts = function (data)
  {
    var i = 0;
    for (i = 0; i < data.length; i += 1)
    {
      this.storePostInfo(data[i]);
    }
    this.renderUserList();
  };

  UserList.prototype.updateChannel = function (channel, members)
  {
    this.members = members;
    var i = 0;
    for (i = 0; i < members.length; i += 1)
    {
      this.addMemberInfo(members[i]);
    }
    if (appnet.user !== null)
    {
      this.addMemberInfo(appnet.user);
    }
    this.renderUserList();
  };

  UserList.prototype.storePostInfo = function (data)
  {
    var created = new Date(data.created_at).getTime();
    if (data.user)
    {
      if (this.postTimes[data.user.username] === undefined ||
          this.postTimes[data.user.username] === null ||
          this.postTimes[data.user.username] < created)
      {
        this.postTimes[data.user.username] = created;
        this.avatars[data.user.username] = data.user.avatar_image.url;
      }
    }
  };

  UserList.prototype.addMemberInfo = function (user)
  {
    if (this.postTimes[user.username] === undefined)
    {
      this.postTimes[user.username] = null;
    }
    this.avatars[user.username] = user.avatar_image.url;
  };

  UserList.prototype.renderUserList = function ()
  {
    var list = $('<ul/>');
    var idleTime = new Date().getTime() - 1000 * 60 * timeout.idle;
    var keys = Object.keys(this.postTimes);
    keys.sort();
    var i = 0;
    for (i = 0; i < keys.length; i += 1)
    {
      if (! this.isIdle(keys[i], idleTime))
      {
        list.append(this.renderUser(keys[i]));
      }
    }
    for (i = 0; i < keys.length; i += 1)
    {
      if (this.isIdle(keys[i], idleTime))
      {
        list.append(this.renderUser(keys[i]));
      }
    }
    this.root.find('.userList').html(list.contents());
  };

  UserList.prototype.isIdle = function (name, idleTime)
  {
    var result = true;
    var postTime = this.postTimes[name];
    if (postTime && postTime >= idleTime)
    {
      result = false;
    }
    return result;
  };

  function getUserClass(name, postTime)
  {
    var result = ' inactive';
    var idleTime = new Date().getTime() - 1000 * 60 * timeout.idle;
    if (appnet.user !== null && name === appnet.user.username)
    {
      result = ' me';
    }
    else if (postTime !== null && postTime >= idleTime)
    {
      result = '';
    }
    return result;
  }

  UserList.prototype.renderUser = function (name)
  {
    var userClass = getUserClass(name, this.postTimes[name]);
    var avatarUrl = '';
    if (this.avatars[name])
    {
      avatarUrl = this.avatars[name];
    }
    var data = {
      name: name,
      avatarUrl: avatarUrl,
      extraClasses: userClass
    };
    return userTemplate(data);
  };

  return UserList;
});
