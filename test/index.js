var assert = require('chai').assert;
var koa = require('koa');
var request = require('supertest-as-promised');
var Replay = require('replay');

var geoip = require('../index');

var app;

//place the HTTP fixtures inside the test directory
Replay.fixtures = __dirname + '/fixtures';

describe('the geoip middleware', function() {
  beforeEach(function() {
    app = koa();
    app.proxy = true;
    app.use(geoip());
    app.use(function *() {
      this.response.type = 'application/json';

      if (this.state.geo.error) {
        this.response.body = this.state.geo.error;
        return
      }

      this.response.body = this.state.geo;
    });
  });

  it('populates the state.geo variable if lookup is successful', function () {
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

  it('stores an error if lookup is unsuccessful', function () {
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

});
