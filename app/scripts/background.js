/*jslint indent: 2, browser: true, vars: true */
/*globals chrome: false, gapi: false, moment: false */
"use strict";
(function () {
  var clientId = "750882903724";
  var apiKey = "AIzaSyAbnPzMTh67tqb0G7A0dLlaLy_QkHX_2L4";
  var scopes = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly";

  var getEvents = function () {
    console.log("Getting events");
    gapi.client.load("calendar", "v3", function () {
      // Get today's events
      var request = gapi.client.calendar.events.list({
        "calendarId": "primary",
        "timeMin": moment().toDate(),
        "timeMax": moment().endOf("day").toDate()
      });
      request.execute(function (response) {
        var i, numberOfEvents = response.items.length;
        console.log("Events updated (" + numberOfEvents + " received)");
        // Update badge with number of events left today
        chrome.browserAction.setBadgeText({text: numberOfEvents.toString()});
      });
    });
  };

  var checkAuthorization = function (immediate, callback) {
    console.log("Checking authorization (" + immediate + ")");
    gapi.auth.authorize({
      client_id: clientId,
      scope: scopes,
      immediate: immediate
    }, function (token) {
      if (token && !token.error) {
        console.log("Authenticated");
        gapi.client.setApiKey(apiKey);
        callback();
      } else {
        console.log("Uh oh... Not authenticated");
        // Show's oAuth pop-up
        checkAuthorization(false, callback);
      }
    });
  };

  // Event listeners
  chrome.runtime.onStartup.addListener(function () {
    console.log("EVENT: Startup");
    checkAuthorization(true, getEvents);
  });
  chrome.runtime.onInstalled.addListener(function () {
    console.log("EVENT: Installed");
    checkAuthorization(true, getEvents);
  });
}());
