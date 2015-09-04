var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var TELIZE_URL = 'http://www.telize.com/geoip';

var isErrorStatus = function(statusCode) {
  return 400 <= statusCode && statusCode <= 500;
};

var matchesWhitelist = function(path, regexes) {
  return regexes.some((regex) => regex.test(path));
};

module.exports = function(options) {
  options = options || {};

  var serviceURL = options.serviceURL || TELIZE_URL;
  var whitelist = options.pathRegexWhitelist;

  return function *(next) {
    if (whitelist && !matchesWhitelist(this.path, whitelist)) {
      //we have a whitelist, and this path doesn't match it
      //skip the rest of the middleware
      return yield next;
    }

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
