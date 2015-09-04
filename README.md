koa-geo-telize
=========

A Koa middleware to retrieve gelocation information for a request based on the
request's originating IP address.

The middleware uses the [Telize](http://www.telize.com/) API to geolocate
incoming requests, and stores the retrieved information in `state.geo`. For
information about the data format and information available, refer to the
"JSON Output Schema" available on the Telize home page.

If the API request is unsuccessful for any reason, the middleware will populate
`state.geo.error` with an object of the following format:

```javascript
    {
        "statusCode": 400, //the HTTP status code of the failed request
        "message": "Invalid IP" //the error message, if any, from Telize
    }
```

Usage
-----

```javascript
    var app = require('koa')();

    app.use(require('koa-geo-telize')());

    app.use(function *() {
      console.log(this.state.geo); 
    });
```


Options
-------

You can pass an options hash as the sole argument to `koa-geo-telize` to
configure the middleware. Available options include:

*   *pathRegexWhitelist* (default: `undefined`): By default, the middleware will
    run against all requests, but if this option is passed, it will only run for
    requests whose path matches a regex in the whitelist. Expects an Array of
    regexs.

*   *serviceURL* (default: `http://www.telize.com/geoip`): The path to the
    Telize API that should be used for geolocation. The live API is not
    rate-limited, but there are no guarantees as to its availability, so you can
    [self-host](https://github.com/fcambus/telize) it if you'd prefer.
