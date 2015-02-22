var scrape = require("./scrape");
var express = require("express");
var pkgInfo = require("./package.json");

var app = express();

app.use(function(req, res, next) {
  res.header("Content-Type", "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, Requested-With, Content-Type, Accept");
  next();
});

app.get("/", function(req, res) {
  res.json({name: "moz-readable", version: pkgInfo.version});
});

app.get("/get", function(req, res) {
  var url = req.query.url;
  if (!url) {
    return res.status(400).json({error: "Missing url parameter"});
  }
  scrape(url).then(function(result) {
    res.json(result);
  }).catch(function(err) {
    res.status(500).json({error: err.message});
  });
});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server listening at http://%s:%s", host, port);
});
