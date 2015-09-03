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
      if (this.state.geo) {
        this.response.body = this.state.geo;
        return;
      }

      this.response.body = {error: 'Geolocation unsuccessful.'};

      this.response.type = 'application/json';
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
});
