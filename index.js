var BEARER = process.env.HONEYWELL_LYRIC_BEARER_TOKEN;

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
    bearer: BEARER,
    args: {
      headers: { "Authorization": "Bearer " + BEARER}
    }
  };

  opts.restClient.get(
    "https://api.honeywell.com/v2/locations?apikey=" 
    + opts.apiKey, opts.args, function (data, response) {
      if (data.code === 401) {
        console.log(util.inspect(data));
      } else {
        if (data.length > 0) {
          opts.locationID = data[0].locationID;
          console.log('opts.locationID: ' + opts.locationID);
        } else {
          console.log('no data returned. has token expired?');
        }
        console.log('2');
        opts.devicesURL = "https://api.honeywell.com/v2/devices?apikey=" + opts.apiKey + "&locationId=" + opts.locationID;
        var query = self.server.where({type: 'thermostat'});
        self.server.find(query, function(err, results) {
          if (results[0]) {
            self.provision(results[0], Thermostat, opts);
          } else {
            self.discover(Thermostat, opts);
          }
        });
        next();
      }
    });
  };
