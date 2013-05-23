/*global require: true */
require(['jquery', 'util', 'appnet', 'bootstrap', 'jquery-cookie'],
function ($, util, appnet, bootstrap, jquery) {
  'use strict';
  var clientId = window.PATTER.config.client_id;

  var getHashParams = function () {
    var hashParams = {};
    var e,
    a = /\+/g,  // Regex for replacing addition symbol with a space
    r = /([^&;=]+)=?([^&;]*)/g,
    d = function (s) { return decodeURIComponent(s.replace(a, ' ')); },
    q = window.location.hash.substring(1),
    b = true;

    /*jshint -W084 */
    while (e = r.exec(q)) {
      hashParams[d(e[1])] = d(e[2]);
    }


    return hashParams;
  };

  var initialize = function () {
    $('#authorize-button').attr('href','https://alpha.app.net/oauth/authenticate?client_id=' + clientId + '&response_type=token&redirect_uri=' + window.location.href + '&scope=messages%20write_post');
    var hashParams = getHashParams();
    var accessToken = hashParams.access_token;
    if (accessToken !== undefined && accessToken !== null) {
      // We have just authorized, redirect to previous URL
      var prevUrl = $.cookie('patterPrevUrl');
      if (prevUrl === null) {
        prevUrl = 'index.html';
      }
      localStorage.patter2Token = accessToken;
      $.removeCookie('patterPrevUrl', '/');
      window.location = prevUrl;
    }
  };

  $(document).ready(initialize);
});
