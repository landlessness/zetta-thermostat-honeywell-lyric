var BEARER = 'Gx8CFDAlPoTLK7OXcjxnp0uD5Q1E';

var API_KEY = process.env.HONEYWELL_LYRIC_CONSUMER_KEY;
var Device = require('zetta-device');
var util = require('util');
var extend = require('node.extend');

var Thermostat = module.exports = function(opts) {
  Device.call(this);
  this.units = 'Fahrenheit';
  this.indoorTemperature = 73.0000;
  this.indoorHumidity = 0.3333;
  this.outdoorTemperature = 57.0000;
  this.outdoorHumidity = 0.4512;
  this.heatSetpoint = 72.0000;
  this.coolSetpoint = 72.0000;
  this.setpoint = this.heatSetpoint;
  this.autoChangeoverActive = true;
  this._mode = 'Off';
  
  this._opts = opts || {};
 
  this.lyricAPI = opts.api;
};
util.inherits(Thermostat, Device);

Thermostat.prototype.init = function(config) {
  config
  .name('Hallway Thermostat')
  .type('thermostat')
  .state('off')
  .when('off', {allow: ['heat', 'cool']})
  .when('heating', {allow: ['off', 'cool', 'setSetpoint']})
  .when('cooling', {allow: ['off', 'heat', 'setSetpoint']})
  .map('heat', this.heat)
  .map('cool', this.cool)
  .map('off', this.off)
  .map('setSetpoint', this.setSetpoint, [{ type:'text', name: 'setpoint'}])
  .monitor('outdoorTemperature')
  .monitor('outdoorHumidity')
  .monitor('indoorTemperature')
  .monitor('indoorHumidity')
  .monitor('setpoint');
};

Thermostat.prototype.off = function(cb) {
  this.state = 'off';
  this._mode = 'Off';
  cb();
  this._callAPI({"mode": "Off"})
}

Thermostat.prototype.heat = function(cb) {
  this.state = 'heating';
  this._mode = 'Heat';
  cb();
  this._callAPI({"mode": "Heat"})
}

Thermostat.prototype.cool = function(cb) {
  this.state = 'cooling'
  this._mode = 'Cool';
  cb();
  this._callAPI({"mode": "Cool"})
}

Thermostat.prototype.setSetpoint = function(setpoint, cb) {
  this.setpoint = this.coolSetpoint = this.heatSetpoint = setpoint;
  cb();
  this._callAPI({"heatSetpoint": setpoint, "coolSetpoint": setpoint})
}

Thermostat.prototype._callAPI = function(newArgs) {
  var args = {
    data: {
      "mode": this._mode,
      "autoChangeoverActive": this.autoChangeoverActive,
      "heatSetpoint": this.heatSetpoint,
      "coolSetpoint": this.coolSetpoint
    },
    headers: { 
      "Authorization": "Bearer " + BEARER,
      "Content-Type": "application/json"
    }
  };

  args = extend(args, newArgs);

  console.log('newArgs: ' + util.inspect(newArgs));
  console.log('args: ' + util.inspect(args));

  this.lyricAPI.post("https://api.honeywell.com/v2/devices/thermostats/TCC-1698680?apikey=" + API_KEY + "&locationId=54086", args, function (data, response) {
    // parsed response body as js object
    console.log('api data: ' + util.inspect(data));
  });
}