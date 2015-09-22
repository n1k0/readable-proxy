(function() {
  "use strict";

  var q = document.querySelector.bind(document);

  function injectReadableContents(params, target) {
    q("#error").classList.add("hide");
    var req = new XMLHttpRequest();
    var apiUrl = [
      "/api/get?sanitize=" + (params.sanitize ? "yes" : "no"),
      "url=" + encodeURIComponent(params.url),
      "userAgent=" + encodeURIComponent(params.userAgent)
    ].join("&");
    req.open("GET", apiUrl, false);
    req.send(null);
    var jsonResponse = JSON.parse(req.responseText);
    if (jsonResponse.error) {
      q("#error").textContent = jsonResponse.error.message;
      q("#error").classList.remove("hide");
      q("#readerable").textContent = "";
      q("#title").textContent = "";
      q("#byline").textContent = "";
      q("#length").textContent = "";
      q("#dir").textContent = "";
      q("#excerpt").textContent = "";
      q("#logs").value = "";
      target.contentDocument.body.innerHTML = "";
    } else {
      q("#error").textContent = "";
      q("#readerable").textContent = jsonResponse.isProbablyReaderable;
      q("#title").textContent = jsonResponse.title;
      q("#byline").textContent = jsonResponse.byline;
      q("#length").textContent = jsonResponse.length;
      q("#dir").textContent = jsonResponse.dir;
      q("#excerpt").textContent = jsonResponse.excerpt;
      q("#logs").value = (jsonResponse.consoleLogs || []).join("\n");
      target.contentDocument.body.innerHTML = jsonResponse.content;
    }
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
