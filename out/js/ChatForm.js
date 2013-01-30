// ChatForm.js
//
// A form used for submitting messages to a Patter chat room.

/*global define:true */
define(['jquery', 'js/appnet',
        'text!template/ChatForm.html',
        'jquery-caret'],
function ($, appnet, chatTemplate) {
  

  function ChatForm(root, channel, postCallback)
  {
    this.root = root;
    this.channelId = channel.id;
    this.postCallback = postCallback;

    root.html(chatTemplate);
    this.input = $('.messageText', root);
    $('.sendForm', root).submit($.proxy(clickSend, this));
    $('.broadcastButton', root).click($.proxy(clickBroadcast, this));
    $('.authorizeButton', root).click($.proxy(clickAuthorize, this));
    $('.sendForm', root).hide();
    $('.must-authorize', root).hide();
    $('.read-only', root).hide();
    if (! appnet.isLogged())
    {
      $('.must-authorize', root).show();
    }
    else if (! channel.writers.you)
    {
      $('.read-only', root).show();
    }
    else
    {
      $('.sendForm', root).show();
    }
  }

  var clickSend = function (event)
  {
    event.preventDefault();
    if (this.input.val().length > 0)
    {
      var text = this.input.val();
      this.postMessage(text, getImageUrl(text));
      this.input.val('');
    }
    return false;
  };

  var clickBroadcast = function (event)
  {
    event.preventDefault();
    if (this.input.val().length > 0)
    {
      var text = this.input.val();
      this.broadcastMessage(text, getImageUrl(text));
      this.input.val('');
    }
    return false;
  };

  var clickAuthorize = function (event)
  {
    event.preventDefault();
    appnet.api.authorize();
    return false;
  };

  ChatForm.prototype.postMessage = function (messageString, annotations, links)
  {
    var post = {
      text: messageString,
      annotations: annotations
    };
    if (links !== undefined)
    {
      post.entities = { links: links };
    }
    appnet.api.createMessage(this.channelId, post, { include_annotations: 1 },
                             $.proxy(completePostMessage, this),
                             $.proxy(failPostMessage, this));
  };

  var completePostMessage = function (response)
  {
    this.postCallback([response.data]);
  };

  var failPostMessage = function (response)
  {
  };

  ChatForm.prototype.broadcastMessage = function (messageString, annotations)
  {
    var postAnnotations = annotations.slice();
    postAnnotations.push({
      type: 'net.app.core.crosspost',
      value: {
        canonical_url: 'http://patter-app.net/room.html?channel=' +
          this.channelId
      }
    });
    var post = {
      text: messageString,
      annotations: postAnnotations
    };
    var context = {
      message: messageString,
      annotations: annotations,
      chat: this
    };
    appnet.api.createPost(post, { include_annotations: 1 },
                          $.proxy(completeBroadcastMessage, context),
                          $.proxy(failBroadcastMessage, context));
  };

  var completeBroadcastMessage = function (response)
  {
    if (response.data)
    {
      var messageAnn = this.annotations.splice();
      var broadcast = appnet.note.broadcastNote(response.data.id,
                                                response.data.canonical_url);
      messageAnn.push(broadcast);
      this.chat.postMessage(this.message, messageAnn);
    }
  };

  var failBroadcastMessage = function (response)
  {
  };


  ChatForm.prototype.insertUserIntoText = function (event)
  {
    event.preventDefault();
    if (appnet.isLogged())
    {
      var user = event.target.id;
      insertText(user, this.input);
    }
    return false;
  };

  function insertText(user, textBox)
  {
    var cursor = textBox.caret().start;
    var text = textBox.val();
    var before = text.substring(0, cursor);
    var after = text.substring(cursor);
    textBox.focus();
    textBox.val(before + user + ' ' + after);
    textBox.caret(cursor + user.length + 1, cursor + user.length + 1);
  }


  function getImageUrl(text) {
    var result = [];
    var match = urlRegex.exec(text);
    if (match !== null) {
      var url = match[0];
      var foundIndex = url.length - 4;
      if (url.indexOf('.jpg') === foundIndex ||
          url.indexOf('.png') === foundIndex ||
          url.indexOf('.gif') === foundIndex) {
        result.push(appnet.note.embedImageNote(url, 200, 200));
      }
    }
    return result;
  }

  // This whole thing pulled from
  // https://github.com/nooodle/noodleapp/blob/master/lib/markdown-to-entities.js
  //
  // Regex pulled from https://github.com/chriso/node-validator and
  // country codes pulled from
  // http://data.iana.org/TLD/tlds-alpha-by-domain.txt

  var urlRegex = /((?:http|https|ftp|scp|sftp):\/\/)?(?:\w+:\w+@)?(?:localhost|(?:(?:[\-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|AC|AD|AE|AF|AG|AI|AL|AM|AN|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BJ|BM|BN|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|CR|CU|CV|CW|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EE|EG|ER|ES|ET|EU|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|ST|SU|SV|SX|SY|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TP|TR|TT|TV|TW|TZ|UA|UG|UK|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|YE|YT|ZA|ZM|ZW))|(?:(?:\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(?:\.(?:\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[\-\w~!$+|.,="'\(\)_\*:]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[\-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[\-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[\-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[\-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[\-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?/ig;

  return ChatForm;
});
