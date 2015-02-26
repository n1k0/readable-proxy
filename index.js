var scrape = require("./scrape");
var express = require("express");
var pkgInfo = require("./package.json");
var html2md = require("html-md");
var markdown = require("markdown");

var app = express();
app.use(express.static("static"));
app.use(express.static("node_modules/bootstrap/dist/css"));

/**
 * Casts a qs string arg into an actual boolean.
 * @param  {String} arg The query string arg.
 * @return {Boolean}
 */
function boolArg(queryParam) {
  if (!queryParam) return false;
  return ["1", "on", "true", "yes", "y"].indexOf(queryParam.toLowerCase()) !== -1;
}

/**
 * Takes a result object and replace native html contents with a safer sanitized
 * version.
 * @param  {Object} resultObject
 * @return {Object}
 */
function sanitizeResult(resultObject) {
  try {
    var sanitized = markdown.parse(html2md(resultObject.content));
    resultObject.content = sanitized;
    resultObject.length = sanitized.length;
    return resultObject;
  } catch (err) {
    throw {error: "Failed HTML sanitization:" + (err || "Unknown reason.")};
  }
}

app.use(function(req, res, next) {
  res.header("Content-Type", "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, Requested-With, Content-Type, Accept");
  next();
});

app.get("/api", function(req, res) {
  res.json({
    name: pkgInfo.name,
    documentation: "https://github.com/n1k0/readable-proxy/blob/master/README.md",
    description: pkgInfo.description,
    version: pkgInfo.version
  });
});

app.get("/api/get", function(req, res) {
  var url = req.query.url, sanitize = boolArg(req.query.sanitize);
  if (!url) {
    return res.status(400).json({error: "Missing url parameter"});
  }
  scrape(url).then(function(result) {
    res.json(sanitize ? sanitizeResult(result) : result);
  }).catch(function(err) {
    res.status(500).json(err);
  });
});

var server = app.listen(process.env.PORT || 3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server listening at http://%s:%s", host, port);
});
