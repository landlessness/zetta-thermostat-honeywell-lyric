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
  var restClient = new RESTClient();
  var query = this.server.where({type: 'thermostat'});
  self.server.find(query, function(err, results) {
    if (results[0]) {
      self.provision(results[0], Thermostat, {api: restClient});
    } else {
      self.discover(ThermostatScout, {api: restClient});
    }
  });
  next();
};
