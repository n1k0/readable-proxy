readable-proxy
==============

Proxy server to retrieve a readable version of any provided url, powered by Node,
[PhantomJS](http://phantom.org/) and [Readability.js](https://github.com/mozilla/readability).

Installation
------------

    $ git clone https://github.com/n1k0/readable-proxy
    $ cd readable-proxy
    $ npm install

Run
---

Starts server on `localhost:3000`:

    $ npm start

Note about CORS: by design, the server will allow any origin to access it, so browsers can consume it from pages hosted on a different domain.

Usage
-----

### `GET /get`

#### Required parameters

- `url`: The URL to retrieve retrieve readable contents from, eg. `https://nicolas.perriault.net/code/2013/get-your-frontend-javascript-code-covered/`.

#### Optional parameters

- `sanitize`: A *boolean string* to enable HTML sanitization (valid truthy boolean strings: "1", "on", "true", "yes", "y"; everything else will be considered falsy):

**Note:** Enabling contents sanitization loses Readability.js specific HTML semantics, though is probably safer for users if you plan to publish retrieved contents on a public website.

#### Example

Content sanitization enabled:

    $ curl http://0.0.0.0:3000/get\?sanitize=y&url\=https://nicolas.perriault.net/code/2013/get-your-frontend-javascript-code-covered/
    {
      "byline":"Nicolas Perriault —",
      "content":"<p><strong>So finally you&#39;re <a href=\"https://nicolas.perriault.net/code/2013/testing-frontend-javascript-code-using-mocha-chai-and-sinon/\">testing",
      "length":2867,
      "title":"Get your Frontend JavaScript Code Covered | Code",
      "uri":"https://nicolas.perriault.net/code/2013/get-your-frontend-javascript-code-covered/"
    }

Content sanitization disabled (default):

    $ curl http://0.0.0.0:3000/get\?url\=https://nicolas.perriault.net/code/2013/get-your-frontend-javascript-code-covered/
    {
      "byline":"Nicolas Perriault —",
      "content":"<div id=\"readability-page-1\" class=\"page\"><section class=\"\">\n<p><strong>So finally you're…",
      "length":3851,
      "title":"Get your Frontend JavaScript Code Covered | Code",
      "uri":"https://nicolas.perriault.net/code/2013/get-your-frontend-javascript-code-covered/"
    }

License
-------

MPL 2.0.
