/*global require: true */
require(['jquery', 'util', 'appnet', 'bootstrap', 'jquery-cookie'],
function ($, util, appnet, bootstrap, jquery) {
  'use strict';

  var initialize = function () {
    $('#authorize-button').attr('href',util.makeAuthorizeUrl());
    var hashParams = util.getHashParams();
    var accessToken = hashParams.access_token;
    if (accessToken !== undefined && accessToken !== null) {
      // We have just authorized, redirect to previous URL
      var prevUrl = $.cookie('patterPrevUrl');
      if (prevUrl === null) {
        prevUrl = 'index.html';
      }
      try
      {
        localStorage.patter2Token = accessToken;
      }
      catch (e) { }
      $.removeCookie('patterPrevUrl', '/');
      window.location = prevUrl;
    }
  };

  $(document).ready(initialize);
});
