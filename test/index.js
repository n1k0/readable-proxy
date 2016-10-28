var expect = require("chai").expect;
var scrape = require("../scrape");
var Promise = require("bluebird");
var sinon = require("sinon");
var childProcess = require("child_process");
var app = require("../server").app;
var request = require("supertest");

describe("Tests", function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe("scrape", function() {
    it("should throw on url arg missing", function() {
      expect(scrape).to.Throw(/Missing url./);
    });

    it("should return a promise", function() {
      sandbox.stub(childProcess, "execFile");

      expect(scrape("http://invalid.test/")).to.be.an.instanceOf(Promise);
    });

    it("should call phantomjs exec with expected args", function() {
      sandbox.stub(childProcess, "execFile");

      scrape("http://invalid.test/");

      sinon.assert.calledOnce(childProcess.execFile);
      expect(childProcess.execFile.getCall(0).args[0]).to.match(/phantomjs/);
      expect(childProcess.execFile.getCall(0).args[1]).to.include("http://invalid.test/");
      expect(childProcess.execFile.getCall(0).args[1][2]).to.match(/Readability\.js/);
    });

    it("should handle rejection on process call error", function(done) {
      var fakeErr = new Error("Boom");
      sandbox.stub(childProcess, "execFile", function(exec, args, cb) {
        cb(fakeErr);
      });

      scrape("http://invalid.test/").catch(function(err) {
        expect(err).eql(fakeErr);
        done();
      });
    });

    it("should reject on stdout json parsing failure", function(done) {
      sandbox.stub(childProcess, "execFile", function(exec, args, cb) {
        cb(null, "invalid.json.string");
      });

      scrape("http://invalid.test/").catch(function(err) {
        expect(err.message).to.match(/Unable to parse JSON proxy response/);
        done();
      });
    });

    it("should reject on data extraction error", function(done) {
      sandbox.stub(childProcess, "execFile", function(exec, args, cb) {
        cb(null, JSON.stringify({error: {message: "Foo"}}));
      });

      scrape("http://invalid.test/").catch(function(err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).eql("Foo");
        done();
      });
    });

    it("should fulfill with a valid json result", function(done) {
      sandbox.stub(childProcess, "execFile", function(exec, args, cb) {
        cb(null, JSON.stringify({title: "plop", content: "plip"}));
      });

      scrape("http://invalid.test/").then(function(result) {
        expect(result.title).eql("plop");
        expect(result.content).eql("plip");
        done();
      });
    });
  });

  describe("server.app", function() {
    describe("Web UI", function() {
      it("should serve Web UI on root endpoint", function(done) {
        request(app)
          .get("/")
          .expect("Content-Type", /text\/html/)
          .expect(200, done);
      });
    });

    describe("API", function() {
      describe("GET /api", function() {
        it("should serve JSON on /api endpoint", function(done) {
          request(app)
            .get("/api")
            .set("Accept", "application/json")
            .expect("Content-Type", /application\/json/)
            .expect(200, done);
        });

        it("should serve app info on /api endpoint", function(done) {
          request(app)
            .get("/api")
            .set("Accept", "application/json")
            .expect("Content-Type", /application\/json/)
            .expect(function(res) {
              expect(res.body.name).eql("readable-proxy");
            })
            .end(done);
        });
      });

      describe("GET /api/get", function() {
        it("should return error if missing url param", function(done) {
          request(app)
            .get("/api/get")
            .expect(400)
            .expect(function(res) {
              expect(res.body.error).eql("Missing url parameter");
            })
            .end(done);
        });

        it("should return scraped response", function(done) {
          sandbox.stub(childProcess, "execFile", function(exec, args, cb) {
            cb(null, JSON.stringify({title: "plop"}));
          });

          request(app)
            .get("/api/get?url=http://invalid.test/")
            .expect(200)
            .expect(function(res) {
              expect(res.body.title).eql("plop");
            })
            .end(done);
        });

        it("should return a server error on call error", function(done) {
          sandbox.stub(childProcess, "execFile", function(exec, args, cb) {
            cb(null, JSON.stringify({error: {message: "fail"}}));
          });

          request(app)
            .get("/api/get?url=http://invalid.test/")
            .expect(500)
            .expect(function(res) {
              expect(res.body.error.message).eql("fail");
            })
            .end(done);
        });

        it("should apply custom user agent when provided", function(done) {
          sandbox.stub(childProcess, "execFile", function(exec, args, cb) {
            cb(null, "{}");
          });

          request(app)
            .get("/api/get?url=http://invalid.test/&userAgent=custom+ua")
            .expect(200)
            .expect(function() {
              expect(childProcess.execFile.getCall(0).args[1]).to.contain("custom ua");
            })
            .end(done);
        });

        it("should return sanitized response when sanitize arg is passed", function(done) {
          sandbox.stub(childProcess, "execFile", function(exec, args, cb) {
            cb(null, JSON.stringify({content: "<p><script>alert('xss')</script>plop</p>"}));
          });

          request(app)
            .get("/api/get?sanitize=1&url=http://invalid.test/")
            .expect(200)
            .expect(function(res) {
              expect(res.body.content).eql("<p>plop</p>");
              expect(res.body.rawText).eql("plop");
            })
            .end(done);
        });
      });
    });
  });
});
