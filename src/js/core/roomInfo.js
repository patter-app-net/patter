// roomInfo.js
//
// Information about the current room the user is chatting in.

/*global define:true */
define(['jquery', 'util', 'appnet'], function ($, util, appnet) {
  'use strict';

  var roomInfo = {
    id: null,
    channel: null,
    members: {},
    changeCallback: null
  };

  roomInfo.updateChannel = function ()
  {
//    $('#loading-message').html("Fetching Channel Information");
    appnet.api.getChannel(this.id, {include_annotations: 1},
                          $.proxy(this.completeChannelInfo, this),
                          $.proxy(failChannelInfo, this));
  };

  roomInfo.completeChannelInfo = function (response)
  {
    var owner = response.data.owner;
    var keyList = Object.keys(this.members);
    var i = 0;
    this.channel = response.data;
    var name = appnet.note.findPatterName(this.channel);
    if (name)
    {
      $('title').html(util.htmlEncode(name) + ' (Patter)');
    }
    else
    {
      $('title').html('Private Message Channel (Patter)');
    }
    for (i = 0; i < keyList.length; i += 1)
    {
      delete this.members[keyList[i]];
    }
    if (owner)
    {
      this.members[owner.username] = owner;
    }
    if (appnet.isLogged() && roomInfo.channel.writers.user_ids.length > 0)
    {
      getWriterInfo();
    }
    else if (this.changeCallback)
    {
      this.changeCallback();
    }
  };

  var failChannelInfo = function (meta)
  {
    if (this.changeCallback)
    {
      this.changeCallback();
    }
  };

  function getWriterInfo()
  {
    var ids = roomInfo.channel.writers.user_ids;
    if (ids)
    {
      appnet.api.getUserList(ids, null, completeWriterInfo, failWriterInfo);
    }
    else if (roomInfo.changecallback)
    {
      roomInfo.changeCallback();
    }
  }

  function completeWriterInfo(response)
  {
    var i = 0;
    for (i = 0; i < response.data.length; i += 1)
    {
      roomInfo.members[response.data[i].username] = response.data[i];
    }

    if (roomInfo.changeCallback)
    {
      roomInfo.changeCallback();
    }
  }

  function failWriterInfo(response)
  {
    if (roomInfo.changeCallback)
    {
      roomInfo.changeCallback();
    }
  }

  return roomInfo;
});
