/*jslint indent: 2, vars: true, browser: true */
/*globals chrome: false, moment: false */
'use strict';
document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({authCheck: true}, function (authenticated) {
    if (authenticated) {
      // Remove loading spinner
      document.getElementById("loading").remove();
      // TODO: Show calendar (using D3.js)
    }
  });
});
