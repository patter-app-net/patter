// allUsers.js
//
// A global container for all user objects

/*global define:true */
define(['jquery', 'underscore', 'backbone'],
function ($, _, Backbone)
{
  'use strict';

  var users = {};

  var allUsers = {

    lookup: function(id) {
      return users[id];
    },

    add: function(newUser) {
      users[newUser.id] = newUser;
    },

    fetchNewUsers: function (channels) {
      var newUsers = findNewUserList(channels);
      if (newUsers.length > 0)
      {
        return $.appnet.user.getList(newUsers).then(function (response) {
          updateUserList(response.data);
        });
      }
      else
      {
        return $.when(null);
      }
    }
  };


  function findNewUserList(channels)
  {
    var result = [];
    var i = 0;
    for (i = 0; i < channels.length; i += 1)
    {
      var channel = channels[i];
      if (channel.owner)
      {
        allUsers.add(channel.owner);
      }
      var j = 0;
      for (j = 0; j < channel.writers.user_ids.length; j += 1)
      {
        var id = channel.writers.user_ids[j];
        if (! users[id])
        {
          result.push(id);
        }
      }
    }
    return result;
  }

  function updateUserList(newUsers)
  {
    var i = 0;
    for (i = 0; i < newUsers.length; i += 1)
    {
      allUsers.add(newUsers[i]);
    }
  }

  return allUsers;
});
