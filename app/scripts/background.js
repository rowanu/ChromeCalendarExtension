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
        var i, numberOfEvents = response.items.length;
        console.log("Events updated (" + numberOfEvents + " received)");
        // Update badge with number of events left today
        chrome.browserAction.setBadgeText({text: numberOfEvents.toString()});

        // HACKZ? What"s the legit way to pass data to the pannel?
        window.eventz = response.items;
        // Context menu
        if (window.hasOwnProperty("parentItemId")) {
          // Clear old events
          chrome.contextMenus.remove(window.parentItemId);
        }
        // Show upcoming events
        if (window.eventz && window.eventz.length > 0) {
          window.parentItemId = chrome.contextMenus.create({
            type: "normal",
            title: "Today's events",
            contexts: ["all"]
          });
          // Children events
          // TODO: Organise by month/day
          for (i = 0; i < window.eventz.length; i += 1) {
            var event = window.eventz[i];
            var startMoment = moment(event.start.dateTime);
            var childItem = chrome.contextMenus.create({
              type: "normal",
              // TODO: Show start time details
              title: window.eventz[i].summary + " @ " + startMoment.hours() + ":" + startMoment.minutes(),
              contexts: ["all"],
              parentId: window.parentItemId
            });
          }
        }
      });
    });
  };

  var handleAuthResult = function (authResult) {
    console.log("CHECKED");
    console.log(authResult);
    if (authResult && !authResult.error) {
      console.log("Authenticated");
      updateEvents();
    } else {
      console.log("Uh oh... Not authenticated");
      // TODO: Restart oAuth process
    }
  };

  var checkAuth = function () {
    console.log("CHECKING");
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
  };

  // Check auth on load
  var handleClientLoad = function () {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth, 1);
  };

  chrome.runtime.onStartup.addListener(function (details) {
    handleClientLoad();
  });

  chrome.runtime.onInstalled.addListener(function (details) {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
  });

  // Check for new events periodically (5mins)
  window.setInterval(function () { updateEvents(); }, 300000);

  // HELPERS
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
        updateEvents();
      });
    });
  };

  // Omnibox
  chrome.omnibox.setDefaultSuggestion({
    "description": "<dim>Enter your event details</dim>"
  });
  chrome.omnibox.onInputEntered.addListener(function (text) {
    console.log("Adding event (omnibox): " + text);
    addEvent(text);
  });

  // Context menu
  // Quick add via selection
  chrome.contextMenus.create({
    type: "normal",
    title: "Add '%s' as event",
    contexts: ["selection"],
    onclick: function (e) {
      var text = e.selectionText;
      console.log("Adding event (context menu): " + text);
      addEvent(text);
    }
  });
}());
