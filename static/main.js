(function() {
  "use strict";

  var q = document.querySelector.bind(document);

  function injectReadableContents(params, target) {
    var req = new XMLHttpRequest();
    var apiUrl = [
      "/api/get?sanitize=" + (params.sanitize ? "yes" : "no"),
      "url=" + encodeURIComponent(params.url),
      "userAgent=" + encodeURIComponent(params.userAgent)
    ].join("&");
    req.open("GET", apiUrl, false);
    req.send(null);
    var jsonResponse = JSON.parse(req.responseText);
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
      injectReadableContents({
        url: url,
        sanitize: q("#sanitize").checked,
        userAgent: q("#userAgent").value
      }, q("#target"));
    });
  }

  window.addEventListener("DOMContentLoaded", init);
})();
