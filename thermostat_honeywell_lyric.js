var Device = require('zetta-device');
var util = require('util');
var extend = require('node.extend');

var Thermostat = module.exports = function(opts) {
  Device.call(this);

  this._opts = opts || {};

  console.log('inspect: ' + util.inspect(opts.data));
  var properties = Object.keys(opts.data);
  for (i=0; i<properties.length; i++) {
    this[properties[i]] = opts.data[properties[i]];
  }

  // these will be set above once the Lyric API `thermostat` (singular) call works
  // this.mode = "Heat";
  // this.autoChangeoverActive = 'true';
  // this.heatSetpoint = 60.0000;
  // this.coolSetpoint = 80.0000;
 
  this._lyricAPI = opts.restClient;
  this._bearer = opts.bearer;
  this._apiKey = opts.apiKey;

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
  this.mode = 'Off';
  cb();
  this._post({"mode": "Off"})
}

Thermostat.prototype.heat = function(cb) {
  this.state = 'heating';
  this.mode = 'Heat';
  cb();
  this._post({"mode": "Heat"})
}

Thermostat.prototype.cool = function(cb) {
  this.state = 'cooling'
  this.mode = 'Cool';
  cb();
  this._post({"mode": "Cool"})
}

Thermostat.prototype.setSetpoint = function(setpoint, cb) {
  this.setpoint = this.coolSetpoint = this.heatSetpoint = setpoint;
  cb();
  this._post({"heatSetpoint": setpoint, "coolSetpoint": setpoint})
}

Thermostat.prototype._post = function(newArgs) {
  var args = {
    data: {
      "mode": this.mode,
      "autoChangeoverActive": this.autoChangeoverActive,
      "heatSetpoint": this.heatSetpoint,
      "coolSetpoint": this.coolSetpoint
    },
    headers: { 
      "Authorization": "Bearer " + this._bearer,
      "Content-Type": "application/json"
    }
  };

  args = extend(args, newArgs);

  console.log('newArgs: ' + util.inspect(newArgs));
  console.log('args: ' + util.inspect(args));
  this._lyricAPI.post("https://api.honeywell.com/v2/devices/thermostat/TCC-1698680?apikey=" + this._apiKey + "&locationId=54086", args, function (data, response) {
    // parsed response body as js object
    console.log('api data: ' + util.inspect(data));
  });
}

