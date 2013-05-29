/*global require: true */
require(['jquery', 'util', 'appnet', 'bootstrap', 'jquery-cookie'],
function ($, util, appnet, bootstrap, jquery) {
  'use strict';
  // Hide the HTML because not all flows require the explanation
  $('body').hide();
  var initialize = function () {
    var urlParams = util.getUrlVars();
    var state = urlParams.state;
    var authorization_url = util.makeAuthorizeUrl(state);
    var hashParams = util.getHashParams();
    var accessToken = hashParams.access_token;

    $('#authorize-button').attr('href', authorization_url);

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
      if (!state) {
        $.removeCookie('patterPrevUrl', '/');
        window.location = prevUrl;
      } else {
        // we need to notify the parent window that we have an authorization
        window.opener.AUTH_DONE();
        window.close();
      }

    } else if (state) {
      // We are in dialog and we haven't just come back from an authorization
      window.location = authorization_url;
    }
    $('body').show();
  };

  $(document).ready(initialize);
});
