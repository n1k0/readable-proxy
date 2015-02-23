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
      var response, error;
      try {
        response = JSON.parse(stdout);
      } catch (e) {
        error = "Unable to parse JSON proxy response.";
      }
      if (response && response.error) {
        error = response.error;
      }
      if (error) {
        reject({error: error});
      } else {
        fulfill(response);
      }
    });
  });
};
