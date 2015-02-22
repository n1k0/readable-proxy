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
    return new Readability(document.location.href, document).parse();
  }, url));
  phantom.exit();
});
