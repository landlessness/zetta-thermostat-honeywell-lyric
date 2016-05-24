var BEARER = 'kxeHGhq78E4oqoZ0MLaoQAey7Yp2';

var API_KEY = process.env.HONEYWELL_LYRIC_CONSUMER_KEY;
var Scout = require('zetta-scout');
var util = require('util');
var Thermostat = require('./thermostat_honeywell_lyric');
var RESTClient = require('node-rest-client').Client;

var ThermostatScout = module.exports = function() {
  Scout.call(this);
}
util.inherits(ThermostatScout, Scout);

ThermostatScout.prototype.init = function(next) {
  console.log('1');
  var self = this;

  var opts = {
    restClient: new RESTClient(),
    apiKey: API_KEY,
    bearer: BEARER
  }
  
  var args = {
    headers: { 
      "Authorization": "Bearer " + opts.bearer
    }
  };

  console.log('2');
  opts.restClient.get(
    "https://api.honeywell.com/v2/devices?apikey=" 
    + opts.apiKey 
    + "&locationId=54086", args, function (data, response) {
      
    console.log('3');

    console.log(util.inspect(data));
    for (i=0; i<data.length; i++) {
      opts.data = data[i];
      console.log(util.inspect(opts.data));
      var query = self.server.where({type: 'thermostat'});
      self.server.find(query, function(err, results) {
        if (results[0]) {
          self.provision(results[0], Thermostat, opts);
        } else {
          self.discover(ThermostatScout, opts);
        }
      });
    }
    next();
  });
};
