var assert = require('chai').assert;
var koa = require('koa');
var request = require('supertest-as-promised');
var Replay = require('replay');

var geoip = require('../index');

var app;

//place the HTTP fixtures inside the test directory
Replay.fixtures = __dirname + '/fixtures';


var serveGeoMiddleware = function *() {
  this.response.type = 'application/json';

  if (!this.state.geo) {
    this.response.body = {
      message: 'Geolocation info not available.'
    };
    return;
  }

  if (this.state.geo.error) {
    this.response.body = this.state.geo.error;
    return
  }

  this.response.body = this.state.geo;
};


describe('the geoip middleware', function() {
  beforeEach(function() {
    app = koa();
    app.proxy = true;
    app.use(geoip());
    app.use(serveGeoMiddleware);
  });

  it('populates the state.geo variable if lookup is successful', function() {
    return request(app.listen())
    .get('/')
    .set('X-Forwarded-For', '216.58.216.196')
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.ip, '216.58.216.196');
      assert.strictEqual(res.body.isp, 'Google Inc.');
      assert.strictEqual(res.body.region, 'California');
    });
  });

  it('stores an error if lookup is unsuccessful', function() {
    return request(app.listen())
    .get('/')
    .set('X-Forwarded-For', 'not-a-valid-ip')
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.statusCode, 400);
      assert.strictEqual(
        res.body.message,
        'Input string is not a valid IP address');
    });
  });

  it('filters paths by regex if a whitelist is passed', function() {
    app = koa();
    app.proxy = true;
    app.use(geoip({
      pathRegexWhitelist: [/foo/]
    }));
    app.use(serveGeoMiddleware);

    var server = app.listen();

    return request(server)
    .get('/foo')
    .set('X-Forwarded-For', '216.58.216.196')
    .expect(200)
    .then((res) => {
      assert.strictEqual(res.body.ip, '216.58.216.196');

      return request(server)
      .get('/bar')
      .set('X-Forwarded-For', '216.58.216.196')
      .expect(200);
    })

    .then((res) => {
      assert.strictEqual(
        res.body.message,
        'Geolocation info not available.');
    });
  });

  it('uses an alternate Telize API if one is passed', function() {
    app = koa();
    app.proxy = true;
    app.use(geoip({
      serviceURL: 'http://telize.com/foobar'
    }));
    app.use(serveGeoMiddleware);

    var server = app.listen();

    return request(server)
    .get('/')
    .set('X-Forwarded-For', '216.58.216.196')
    .expect(200)
    .then((res) => {
      //the Telize path we specified is invalid, so we expect to get a 404 and
      //no server-specified error message
      assert.strictEqual(res.body.statusCode, 404);
      assert.strictEqual(res.body.message, null);
    });

    
  });


});
