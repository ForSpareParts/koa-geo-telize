koa-geoip
=========

A Koa middleware to retrieve gelocation information for a request based on the
request's originating IP address.

The middleware uses the [Telize](http://www.telize.com/) API to geolocate
incoming requests, and stores the retrieved information in `state.geo`. For
information about the data format and information available, refer to the
"JSON Output Schema" available on the Telize home page.

If the API request is unsuccessful for any reason, the middleware will populate
`state.geo.error` with an object of the following format:

{
    "statusCode": 400, //the HTTP status code of the failed request
    "message": "Invalid IP" //the error message, if any, from Telize
}


Usage
-----

    var app = require('koa')();

    app.use(require('koa-geoip')());

    app.use(function *() {
      console.log(this.state.geo); 
    });



Self-Hosting
------------

The Telize API is not rate-limited, but there are no guarantees as to its
availability. If you'd prefer to [self-host the API](https://github.com/fcambus/telize),
you can simply pass the URL of your API instance as the `serviceURL` parameter
of an options hash, i.e.:

    require('koa-geoip')({serviceURL: 'http://my.telize.instance'});
