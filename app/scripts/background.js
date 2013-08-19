/*jslint indent: 2, browser: true, vars: true */
/*globals chrome: false, gapi: false, moment: false */
"use strict";
(function () {
  var clientId = "750882903724";
  var apiKey = "AIzaSyAbnPzMTh67tqb0G7A0dLlaLy_QkHX_2L4";
  var scopes = "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly";

  var handleAuthorize = function (token) {
    // console.log(token);
    if (token && !token.error) {
      console.log("Authenticated");
      gapi.client.setApiKey(apiKey);
    } else {
      console.log("Uh oh... Not authenticated");
      // Show's oAuth pop-up
      checkAuthorization(false);
    }
  };

  var checkAuthorization = function (immediate) {
    console.log("Checking authorization (" + immediate + ")");
    gapi.auth.authorize({
      client_id: clientId,
      scope: scopes,
      immediate: immediate
    }, handleAuthorize);
  };

  // Event listeners
  chrome.runtime.onStartup.addListener(function () {
    console.log("EVENT: Startup");
    checkAuthorization(true);
  });
  chrome.runtime.onInstalled.addListener(function () {
    console.log("EVENT: Installed");
    checkAuthorization(true);
  });
}());
