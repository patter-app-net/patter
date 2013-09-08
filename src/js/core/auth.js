// auth.js
//
// This code is only ever invoked when an embedded instance is trying
// to authorize. It acts as a shim, opening the authorization window
// and then passing the access token back to the opener.

/*global require: true */
require(['jquery', 'util'],
function ($, util) {
  'use strict';

  var initialize = function () {
    var urlParams = util.getUrlVars();
    var state = urlParams.state;
    var authorization_url = util.makeAuthorizeUrl(state);
    var hashParams = util.getHashParams();
    var accessToken = hashParams.access_token;

    if (accessToken) {
      // we need to notify the parent window that we have an authorization
      window.opener.AUTH_DONE(accessToken);
      window.close();
    } else if (state) {
      // We are in dialog and we haven't just come back from an authorization
      window.location = authorization_url;
    }
  };

  $(document).ready(initialize);
});
