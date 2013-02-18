// PatterEmbed.js
//
// An embeddable version of Patter. It provides handlers for chat
// history, chat input, and a user list. It is up to the caller to feed
// it new messages and a channel to post in.

/*global define:true */
define(['jquery', './ChatForm', './UserList', './ChatHistory'],
function ($, ChatForm, UserList, ChatHistory) {
  

  function PatterEmbed(channel, members,
                       formRoot, userRoot, historyRoot, postCallback)
  {
    this.form = new ChatForm(formRoot, channel, postCallback);
    var insertCallback = $.proxy(this.form.insertUserIntoText, this.form);
    this.user = new UserList(userRoot, insertCallback);
    this.history = new ChatHistory(historyRoot, insertCallback,
                                  this.user.avatars);
    this.user.updateChannel(channel, members);
  }

  PatterEmbed.prototype.addPosts = function (posts, goBack)
  {
    this.user.updatePosts(posts);
    this.history.update(posts, goBack);
  };

  return PatterEmbed;
});
