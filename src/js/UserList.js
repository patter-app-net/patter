// UserList.js
//
// A pane showing a scrollable list of recent users and members

/*global define:true */
define(['jquery', 'util', 'appnet',
        'text!template/user.html'],
function ($, util, appnet, userTemplate) {
  'use strict';

  function UserList(root, userCallback)
  {
    this.root = root;
    this.userCallback = userCallback;
    this.members = {};
    this.postTimes = {};
    this.avatars = {};
    this.myUser = null;
    this.activeList = {};
    this.idleList = {};
    this.user = $(userTemplate);
  }

  var timeout = {
    // Times in minutes;
    gone: 10,
    idle: 3
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
    var goneTime = new Date().getTime() - 1000 * 60 * timeout.gone;
    var keys = Object.keys(this.postTimes);
    var i = 0;
    this.recent = {};
    keys.sort();
    for (i = 0; i < keys.length; i += 1)
    {
      var postTime = this.postTimes[keys[i]];
      var shouldShow = ((postTime !== null && postTime >= goneTime) ||
                        this.members[keys[i]] !== undefined);
      if (shouldShow)
      {
        this.updateUser(keys[i], postTime);
      }
      else
      {
        this.removeUser(keys[i]);
      }
    }
  };

  UserList.prototype.updateUser = function (name, postTime)
  {
    var userClass = getUserClass(name, postTime);
    if (userClass === 'myAccount')
    {
      if (this.myUser === null)
      {
        this.myUser = this.renderUser(name, userClass);
        this.root.append(this.myUser);
      }
    }
    else if (userClass === 'activeUser')
    {
      if (this.idleList[name] !== undefined)
      {
        this.activeList[name] = this.idleList[name];
        delete this.idleList[name];
        $('.userName', this.activeList[name]).removeClass('idleUser');
        $('.userName', this.activeList[name]).addClass('activeUser');
      }
      else if (this.activeList[name] === undefined)
      {
        this.activeList[name] = this.renderUser(name, userClass);
        this.root.append(this.activeList[name]);
      }
    }
    else if (userClass === 'idleUser')
    {
      if (this.activeList[name] !== undefined)
      {
        this.idleList[name] = this.activeList[name];
        delete this.activeList[name];
        $('.userName', this.idleList[name]).removeClass('activeUser');
        $('.userName', this.idleList[name]).addClass('idleUser');
      }
      else if (this.idleList[name] === undefined)
      {
        this.idleList[name] = this.renderUser(name, userClass);
        this.root.append(this.idleList[name]);
      }
    }
  };

  function getUserClass(name, postTime)
  {
    var result = 'idleUser';
    var idleTime = new Date().getTime() - 1000 * 60 * timeout.idle;
    if (appnet.user !== null && name === appnet.user.username)
    {
      result = 'myAccount';
    }
    else if (postTime !== null && postTime >= idleTime)
    {
      result = 'activeUser';
    }
    return result;
  }

  UserList.prototype.removeUser = function (name)
  {
    if (this.idleList[name] !== undefined)
    {
      this.idleList[name].remove();
      delete this.idleList[name];
    }
    if (this.activeList[name] !== undefined)
    {
      this.activeList[name].remove();
      delete this.activeList[name];
    }
  };

  UserList.prototype.renderUser = function (name, userClass)
  {
    var result = this.user.clone();
    var nameNode = $('.userName', result);
    $('.userAvatar', result).attr('href', 'http://alpha.app.net/' + name);
    $('.userAvatarImg', result).attr('src', this.avatars[name]);
    nameNode.html('@' + name);
    nameNode.attr('id', '@' + name);
    nameNode.addClass(userClass);
    nameNode.on('click', this.userCallback);
    return result;
  };

  return UserList;
});
