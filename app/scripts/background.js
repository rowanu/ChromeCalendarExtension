/*jslint indent: 2, browser: true, vars: true */
/*globals chrome: false, gapi: false */
"use strict";
(function () {
  // Omnibox
  chrome.omnibox.setDefaultSuggestion({
    "description": "<dim>Enter your event details</dim>"
  });
  chrome.omnibox.onInputEntered.addListener(function (text) {
    console.log("Adding event: " + text);
    // TODO: Check auth'd
    gapi.client.load("calendar", "v3", function () {
      var request = gapi.client.calendar.events.quickAdd({
        calendarId: "primary",
        text: text
      });

      request.execute(function (response) {
        console.log(response);
        // TODO: Give user feedback (notification?)
      });
    });
  });

  // Code from:
  // https://code.google.com/p/google-api-javascript-client/source/browse/samples/authSample.html
  chrome.runtime.onInstalled.addListener(function (details) {
    var clientId = "161424625207";
    var apiKey = "AIzaSyBtDGNHd29wHMOHk9Mw-HWu_KsufPxnNTw";
    var scopes = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly";

    // Load the API and make an API call.  Display the results on the screen.
    var makeApiCall = function () {
      gapi.client.load("calendar", "v3", function () {
        var request = gapi.client.calendar.events.list({
          "calendarId": "primary",
          "timeMin": new Date(),
          "maxResults": 10
        });

        // TODO: Refresh data periodically
        request.execute(function (response) {
          console.log(response); // TODO: Remove, testing

          // HACK? What"s the legit way to pass data to the pannel?
          window.eventz = response.items;
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

}());
