// util.js
//
// General utility functions of use to any JavaScript project

/*global define:true */
define(['jquery'], function ($) {
  

  var util = {};

  util.redirect = function (dest)
  {
    window.location = dest;
  };

  util.getUrlVars = function ()
  {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    var i = 0;
    for (i = 0; i < hashes.length; i += 1)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  };

  util.htmlEncode = function (value)
  {
    var result = '';
    if (value) {
      result = $('<div />').text(value).html();
    }
    return result;
  };

  util.htmlDecode = function (value)
  {
    var result = '';
    if (value) {
      result = $('<div />').html(value).text();
    }
    return result;
  };


  util.stripSpaces = function (str)
  {
    return str.replace(/ +$/g, '').replace(/^ +/g, '');
  };

  util.flagError = function (id, message)
  {
    var newAlert = '<div class="alert alert-error">' +
          '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
          '<strong>Error:</strong> ' + message +
          '</div>';
    $('#' + id).html(newAlert);
  };

  util.has_focus = true;
  $(window).on('focus', function () {
    util.has_focus = true;
  });
  $(window).on('blur', function () {
    util.has_focus = false;
  });

  return util;
});
