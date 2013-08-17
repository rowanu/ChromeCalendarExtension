/*jslint indent: 2, vars: true, browser: true */
/*globals chrome: false */
'use strict';

// TODO: Use moment.js to format dates nicely

document.addEventListener('DOMContentLoaded', function () {
  var i;
  var backgroundPage = chrome.extension.getBackgroundPage();
  var events = backgroundPage.eventies.map(function (i) { return i.summary + ": " + i.start.dateTime + " to " + i.end.dateTime; });
  var ul = document.createElement("ul");
  for (i = 0; i < events.length; i += 1) {
    var li = document.createElement("li");
    li.innerText = events[i];
    ul.appendChild(li);
  }
  document.body.appendChild(ul);

    // chrome.extension.onMessage.addListener(function (response) {
    //   console.log("OHAI client");
    //   // console.log(response);
    //   // var div = document.createElement("div");
    //   // var message = document.createTextNode(response.items.join("<br />\n"));
    //   // console.log(message);
    //   // div.appendChild(message);
});
