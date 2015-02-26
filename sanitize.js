var html2md = require("html-md");
var markdown = require("markdown");

/**
 * Takes a result object and replace native html contents with a safer sanitized
 * version.
 * @param  {Object} resultObject
 * @return {Object}
 */
exports.sanitizeResult = function(resultObject) {
  try {
    var sanitized = markdown.parse(html2md(resultObject.content));
    resultObject.content = sanitized;
    resultObject.length = sanitized.length;
    return resultObject;
  } catch (err) {
    throw {error: "Failed HTML sanitization:" + (err || "Unknown reason.")};
  }
};
