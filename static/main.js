(function() {
  "use strict";

  var q = document.querySelector.bind(document);

  function injectReadableContents(url, sanitize, target) {
    var req = new XMLHttpRequest();
    req.open("GET", "/api/get?sanitize=" + (sanitize ? "yes" : "no") + "&url=" + encodeURIComponent(url), false);
    req.send(null);
    var jsonResponse = JSON.parse(req.responseText);
    console.log(jsonResponse);
    q("#title").textContent = jsonResponse.title;
    q("#byline").textContent = jsonResponse.byline;
    q("#length").textContent = jsonResponse.length;
    q("#dir").textContent = jsonResponse.dir;
    q("#excerpt").textContent = jsonResponse.excerpt;
    target.contentDocument.body.innerHTML = jsonResponse.content;
  }

  function init() {
    q("form").addEventListener("submit", function(event) {
      event.preventDefault();
      var url = q("#url").value;
      q("#source").src = url;
      injectReadableContents(url, q("#sanitize").checked, q("#target"));
    });
  }

  window.addEventListener("DOMContentLoaded", init);
})();
