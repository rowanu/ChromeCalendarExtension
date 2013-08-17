'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);

  var oauth = ChromeExOAuth.initBackgroundPage({
    'request_url' : 'https://www.google.com/accounts/OAuthGetRequestToken',
    'authorize_url' : 'https://www.google.com/accounts/OAuthAuthorizeToken',
    'access_url' : 'https://www.google.com/accounts/OAuthGetAccessToken',
    'consumer_key' : 'anonymous',
    'consumer_secret' : 'anonymous',
    'scope' : 'https://www.googleapis.com/auth/calendar',
    'app_name' : 'Chrome Calendar'
  });

  function callback(resp, xhr) {
    console.log(resp);
  };

  // TODO: move anon function out
  oauth.authorize(function() {
    console.log("OHAI")
    var url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
    var request = {
      'method': 'GET',
      'parameters': {'alt': 'json'}
    };

    // Send: GET https://docs.google.com/feeds/default/private/full?alt=json
    oauth.sendSignedRequest(url, callback, request);
  });
});
