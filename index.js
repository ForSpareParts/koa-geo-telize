var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var TELIZE_URL = 'http://www.telize.com/geoip';

module.exports = function(options) {
  options = options || {};

  var serviceURL = options.serviceURL || TELIZE_URL;

  return function *(next) {
    var ip = this.request.ip || this.request.ips[0];
    if (ip) {
      var geoResponse = (yield request(serviceURL + '/' + ip))[0];
      this.state.geo = geoResponse.body;
    }

    yield next;
  };
};
