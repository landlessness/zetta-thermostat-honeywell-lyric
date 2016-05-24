var BEARER = '8abT5cA6DnJ7DyAykFIg2u4Ynze6';

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

opts.restClient.get("https://api.honeywell.com/v2/devices/thermostat/TCC-1698680?apikey=" + opts.apiKey + "&locationId=54086", args, function (data, response) {
  opts.data = data;
  var query = self.server.where({type: 'thermostat'});
  self.server.find(query, function(err, results) {
    if (results[0]) {
      self.provision(results[0], Thermostat, opts);
    } else {
      self.discover(ThermostatScout, opts);
    }
  });
  next();
});
    
};
