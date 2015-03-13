var system = require("system");
var page = require("webpage").create();
var url = system.args[1];
var readabilityPath = system.args[2];
var userAgent = system.args[3];

// Prevent page js errors to break JSON output
// XXX: should we log these instead?
phantom.onError = page.onError = function(){};

function exitWithError(message) {
  outputJSON({error: message});
  phantom.exit();
}

function outputJSON(object) {
  console.log(JSON.stringify(object, null, 2));
}

if (!url) {
  exitWithError("Missing url arg.");
} else if (!readabilityPath) {
  exitWithError("Missing readabilityPath arg.");
}

if (userAgent) {
  page.settings.userAgent = userAgent;
}

page.open(url, function(status) {
  if (status !== "success") {
    return exitWithError("Unable to access " + url);
  }
  if (!page.injectJs(readabilityPath)) {
    exitWithError("Couldn't inject " + readabilityPath);
  }
  outputJSON(page.evaluate(function(url, userAgent, pageContent) {
    var location = document.location;
    var uri = {
      spec: location.href,
      host: location.host,
      prePath: location.protocol + "//" + location.host, // TODO This is incomplete, needs username/password and port
      scheme: location.protocol.substr(0, location.protocol.indexOf(":")),
      pathBase: location.protocol + "//" + location.host + location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)
    };
    try {
      var result = new Readability(uri, document).parse();
      if (result) {
        result.userAgent = userAgent;
      } else {
        result = {
          error: {
            message: "Empty result from Readability.js.",
            sourceHTML: pageContent || "Empty page content."
          }
        };
      }
      return result;
    } catch (err) {
      return {
        error: {
          message: err.message,
          line: err.line,
          stack: err.stack,
          sourceHTML: pageContent || "Empty page content."
        }
      };
    }
  }, url, page.settings.userAgent, page.content));
  phantom.exit();
});
