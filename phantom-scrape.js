var system = require("system");
var page = require("webpage").create();
var url = system.args[1];

// Prevent page js errors to break JSON output
// XXX: should we log these instead?
phantom.onError = page.onError = function(){};

function outputJSON(object) {
  console.log(JSON.stringify(object, null, 2));
}

if (!url) {
  outputJSON({error: "Missing url"});
  phantom.exit();
}

page.open(url, function(status) {
  if (status !== "success") {
    outputJSON({error: "Unable to access " + url});
    return phantom.exit();
  }
  page.injectJs("vendor/Readability.js");
  outputJSON(page.evaluate(function(url) {
    var location = document.location;
    var uri = {
      spec: location.href,
      host: location.host,
      prePath: location.protocol + "//" + location.host, // TODO This is incomplete, needs username/password and port
      scheme: location.protocol.substr(0, location.protocol.indexOf(":")),
      pathBase: location.protocol + "//" + location.host + location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)
    };
    try {
      return new Readability(uri, document).parse();
    } catch (err) {
      return {error: err};
    }
  }, url));
  phantom.exit();
});
