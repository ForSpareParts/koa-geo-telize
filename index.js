var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var TELIZE_URL = 'http://www.telize.com/geoip';

var isErrorStatus = function(statusCode) {
  return 400 <= statusCode && statusCode <= 500;
}

module.exports = function(options) {
  options = options || {};

  var serviceURL = options.serviceURL || TELIZE_URL;

  return function *(next) {
    var ip = this.request.ip || this.request.ips[0];

    if (ip) {
      var geoResponse = (yield request(serviceURL + '/' + ip, {json: true}))[0];

      if (isErrorStatus(geoResponse.statusCode)) {
        this.state.geo = {
          error: {
            statusCode: geoResponse.statusCode,
            message: geoResponse.body.message || null 
          }
        }
      }
      else {
        this.state.geo = geoResponse.body;
      }
    }

    yield next;
  };
};
