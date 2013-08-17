/*jslint indent: 2, browser: true, vars: true */
/*globals chrome: false, gapi: false */
'use strict';

// Code from:
// https://code.google.com/p/google-api-javascript-client/source/browse/samples/authSample.html
chrome.runtime.onInstalled.addListener(function (details) {
  var clientId = '161424625207';
  var apiKey = 'AIzaSyBtDGNHd29wHMOHk9Mw-HWu_KsufPxnNTw';
  var scopes = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly';

  // Load the API and make an API call.  Display the results on the screen.
  var makeApiCall = function () {
    gapi.client.load('calendar', 'v3', function () {
      var request = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'maxResults': 10
      });

      request.execute(function (response) {
        console.log(response);

        window.eventies = response.items;
      });
    });
  };

  var handleAuthResult = function (authResult) {
    if (authResult && !authResult.error) {
      console.log("Authenticated");
      makeApiCall();
    } else {
      console.log("Uh oh...");
    }
  };

  var checkAuth = function () {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
  };

  // Use a button to handle authentication the first time.
  var handleClientLoad = function () {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth, 1);
  };

  handleClientLoad();
});
