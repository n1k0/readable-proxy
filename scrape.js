var childProcess = require("child_process");
var phantomjs = require("phantomjs");
var binPath = phantomjs.path;
var path = require("path");
var Promise = require("bluebird");

module.exports = function scrape(url) {
  return new Promise(function(fulfill, reject) {
    var childArgs = [path.join(__dirname, "phantom-scrape.js"), url];
    childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
      if (err) {
        return reject(err);
      }
      try {
        fulfill(JSON.parse(stdout));
      } catch (e) {
        reject(new Error("Unable to parse JSON proxy response."));
      }
    });
  });
};
