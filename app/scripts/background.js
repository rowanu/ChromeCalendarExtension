/*jslint indent: 2, browser: true, vars: true */
/*globals chrome: false, gapi: false, moment: false */
// TODO: Fix state assumptions (order of page loading, API calls, etc)
"use strict";
(function () {
  var clientId = "161424625207";
  var apiKey = "AIzaSyBtDGNHd29wHMOHk9Mw-HWu_KsufPxnNTw";
  var scopes = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly";

  var updateEvents = function () {
    console.log("Updating events...");
    gapi.client.load("calendar", "v3", function () {
      // Get today's events
      var request = gapi.client.calendar.events.list({
        "calendarId": "primary",
        "timeMin": moment().toDate(),
        "timeMax": moment().endOf("day").toDate()
      });

      request.execute(function (response) {
        var numberOfEvents = response.items.length;
        console.log("Events updated (" + numberOfEvents + " received)");
        // Update badge with number of events left today
        chrome.browserAction.setBadgeText({text: numberOfEvents.toString()});

        // HACK? What"s the legit way to pass data to the pannel?
        window.eventz = response.items;
      });
    });
  };

  var handleAuthResult = function (authResult) {
    if (authResult && !authResult.error) {
      console.log("Authenticated");
      updateEvents();
    } else {
      console.log("Uh oh... Not authenticated");
      // TODO: Restart oAuth process
    }
  };

  var checkAuth = function () {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
  };

  // Check auth on load
  var handleClientLoad = function () {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth, 1);
  };

  chrome.runtime.onInstalled.addListener(function (details) {
    handleClientLoad();
  });

  // Check for new events periodically (5mins)
  window.setInterval(function () { updateEvents(); }, 300000);

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
        // Notify of added
        // TODO: Handle errors (with generic message)
        var notification = window.webkitNotifications.createNotification(
          "images/icon-128.png",
          "Event added!",
          "Added " + response.summary + " at " + moment(response.start.dateTime).calendar()
        );
        notification.ondisplay = function (event) {
          setTimeout(function () {
            event.currentTarget.cancel();
          }, 5000);
        };
        notification.show();
        updateEvents();
      });
    });
  });
}());
