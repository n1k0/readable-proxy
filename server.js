var scrape = require("./scrape");
var sanitizeResult = require("./sanitize").sanitizeResult;
var express = require("express");
var pkgInfo = require("./package.json");
var cheerio = require("cheerio");

var app = express();
exports.app = app;

app.use(express.static("static"));
app.use(express.static("node_modules/bootstrap/dist/css"));

/**
 * Casts a query string arg into an actual boolean value.
 * @param  {String} arg The query string arg.
 * @return {Boolean}
 */
function boolArg(queryParam) {
  if (!queryParam) return false;
  return ["1", "on", "true", "yes", "y"].indexOf(queryParam.toLowerCase()) !== -1;
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
  var url = req.query.url,
      sanitize = boolArg(req.query.sanitize),
      userAgent = req.query.userAgent;
  if (!url) {
    return res.status(400).json({error: "Missing url parameter"});
  }
  function handleError(err) {
    console.error(err);
    res.status(500).json({error: {message: err.message}});
  }
  scrape(url, {userAgent: userAgent})
    .then(function(result) {
      if (!result) {
        throw new Error("No scraped result received.");
      }

      var sanitizedResult = sanitizeResult(result);
      var $ = cheerio.load(sanitizedResult.content);
      var rawText = $('*').contents().map(function() {
          return (this.type === 'text') ? $(this).text() + ' ' : '';
      }).get().join('');

      result.rawText = rawText.trim();

      res.json(sanitize ? sanitizedResult : result);
    })
    .catch(handleError);
});

exports.serve = function() {
  var server = app.listen(process.env.PORT || 3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server listening at http://%s:%s", host, port);
  });
};
