var childProcess = require("child_process");
var phantomjs = require("phantomjs-prebuilt");
var binPath = phantomjs.path;
var path = require("path");
var Promise = require("bluebird");
var objectAssign = require("object-assign");

var readabilityPath = process.env.READABILITY_LIB_PATH ||
                      path.normalize(path.join(__dirname, "vendor", "Readability.js"));

module.exports = function scrape(url, options) {
  options = options || {};
  if (!url) throw new Error("Missing url.");
  return new Promise(function(fulfill, reject) {
    var childArgs = [path.join(__dirname, "phantom-scrape.js"), url, readabilityPath];
    if (options.userAgent) {
      childArgs.push(options.userAgent);
    }
    childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
      if (err) {
        return reject(err);
      }
      var response, error;
      try {
        response = JSON.parse(stdout);
      } catch (e) {
        error = {
          message: "Unable to parse JSON proxy response.",
          line: e.line,
          stack: e.stack
        };
      }
      if (response && response.error) {
        error = response.error;
      }
      if (error) {
        reject(objectAssign(new Error(error.message), error));
      } else if (!response) {
        reject(new Error("Empty scraped response."));
      } else {
        fulfill(response);
      }
    });
  });
};
