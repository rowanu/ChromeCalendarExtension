/*jslint indent: 2, browser: true, vars: true, nomen: true */
/*globals chrome: false, gapi: false, moment: false, _: false */
"use strict";
(function () {
  var clientId = "750882903724";
  var apiKey = "AIzaSyAbnPzMTh67tqb0G7A0dLlaLy_QkHX_2L4";
  var scopes = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly";
  // ChromeCalendar container and defaults
  var cc = document.cc = {};
  document.cc.authenticated = false;
  // Placeholder badge value while updating
  chrome.browserAction.setBadgeText({text: "..."});

  var getEvents = function () {
    console.log("Getting events");
    gapi.client.load("calendar", "v3", function () {
      // TODO: All-day events have NO TIMEZONE - ignore?
      // Get today's events
      var request = gapi.client.calendar.events.list({
        calendarId: "primary",
        singleEvents: true,
        showDeleted: false,
        timeMin: moment().toDate(),
        timeMax: moment().endOf("day").toDate()
      });
      request.execute(function (response) {
        var numberOfEvents = response.hasOwnProperty("items") ? response.items.length : 0;
        console.log("Events updated (" + numberOfEvents + " received)");
        _.each(response.items, function (e, i) {
          console.log(i + ": " + e.summary + " (" + e.status + ")");
          // console.log(e);
        });
        // Update badge with number of events left today
        chrome.browserAction.setBadgeText({text: (numberOfEvents > 0) ? numberOfEvents.toString() : "" });
      });
    });
  };
  // Add event via quick add request
  var addEvent = function (text) {
    console.log("Adding event: " + text);
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
        getEvents();
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
        document.cc.authenticated = true;
        callback();
      } else {
        console.log("Uh oh... Not authenticated");
        // Show's oAuth pop-up
        checkAuthorization(false, callback);
      }
    });
  };

  // Event Listeners
  chrome.runtime.onStartup.addListener(function () {
    checkAuthorization(true, getEvents);
  });
  chrome.runtime.onInstalled.addListener(function () {
    checkAuthorization(true, getEvents);
  });
  // Message Listeners
  chrome.runtime.onMessage.addListener(function (request, sender, responder) {
    if (request.authCheck) {
      responder(cc.authenticated);
    }
  });
  // Omnibox
  chrome.omnibox.setDefaultSuggestion({
    "description": "<dim>Enter your event details</dim>"
  });
  chrome.omnibox.onInputEntered.addListener(function (text) {
    console.log("Adding event (omnibox): " + text);
    addEvent(text);
  });
}());
