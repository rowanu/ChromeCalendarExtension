/*jslint indent: 2, vars: true, browser: true */
/*globals chrome: false */
'use strict';

// TODO: Use moment.js to format dates nicely
document.addEventListener('DOMContentLoaded', function () {
  var i;
  var ul = document.createElement("ul");
  var backgroundPage = chrome.extension.getBackgroundPage();
  var events = backgroundPage.eventz.map(function (i) { return i.summary + ": " + i.start.dateTime + " to " + i.end.dateTime; });
  for (i = 0; i < events.length; i += 1) {
    var li = document.createElement("li");
    li.innerText = events[i];
    ul.appendChild(li);
  }
  document.body.appendChild(ul);
  document.body.removeChild(document.getElementById("retry"));
});
