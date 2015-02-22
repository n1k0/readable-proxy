var system = require("system");
var page = require("webpage").create();
var url = system.args[1];

function json(o) {
  console.log(JSON.stringify(o, null, 2));
}

if (!url) {
  json({error: "Missing url"});
  phantom.exit();
}

page.open(url, function(status) {
  if (status !== "success") {
    json({error: "Unable to open " + url});
    return phantom.exit();
  }
  page.injectJs("vendor/Readability.js");
  json(page.evaluate(function(url) {
    var location = document.location;
    var uri = {
      spec: location.href,
      host: location.host,
      prePath: location.protocol + "//" + location.host, // TODO This is incomplete, needs username/password and port
      scheme: location.protocol.substr(0, location.protocol.indexOf(":")),
      pathBase: location.protocol + "//" + location.host + location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)
    };
    return new Readability(uri, document).parse();
  }, url));
  phantom.exit();
});
