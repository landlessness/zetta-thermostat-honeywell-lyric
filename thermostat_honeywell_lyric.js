var Device = require('zetta-device');
var util = require('util');
var extend = require('node.extend');

var Thermostat = module.exports = function(opts) {
  Device.call(this);

  this._opts = opts || {};

  this._lyricAPI = this._opts.restClient;
  this._bearer = this._opts.bearer;
  this._apiKey = this._opts.apiKey;
  this.locationID = this._opts.locationID;
  console.log('opts.locationID: ' + opts.locationID);
  console.log('locationID: ' + this.locationID);
  
  this._syncState();
  var self = this;
  setInterval(function() {self._syncState()}, 5000);
};
util.inherits(Thermostat, Device);

Thermostat.prototype.init = function(config) {
  config
  .name('Lyric Thermostat')
  .type('thermostat')
  .state(this.state)
  .when('off', {allow: ['heat', 'cool']})
  .when('heating', {allow: ['off', 'cool', 'setSetpoint']})
  .when('cooling', {allow: ['off', 'heat', 'setSetpoint']})
  .map('heat', this.heat)
  .map('cool', this.cool)
  .map('off', this.off)
  .map('setSetpoint', this.setSetpoint, [{ type:'text', name: 'setpoint'}])
  .monitor('indoorTemperature')
  .monitor('outdoorTemperature')
  .monitor('indoorHumidity')
  .monitor('autoChangeoverActive')
  .monitor('heatSetpoint')
  .monitor('coolSetpoint');
};

Thermostat.prototype.off = function(cb) {
  this.state = 'off';
  this.mode = 'Off';
  this._post({"mode": "Off"}, cb)
}

Thermostat.prototype.heat = function(cb) {
  this.state = 'heating';
  this.mode = 'Heat';
  this._post({"mode": "Heat"}, cb)
}

Thermostat.prototype.cool = function(cb) {
  this.state = 'cooling'
  this.mode = 'Cool';
  this._post({"mode": "Cool"}, cb)
}

Thermostat.prototype.setSetpoint = function(setpoint, cb) {
  this.setpoint = this.coolSetpoint = this.heatSetpoint = setpoint;
  this._post({"heatSetpoint": setpoint, "coolSetpoint": setpoint}, cb)
}

Thermostat.prototype._post = function(newArgs, cb) {
  var postData = {
    "mode": this.mode,
    "autoChangeoverActive": this.autoChangeoverActive,
    "heatSetpoint": this.setpoint,
    "coolSetpoint": this.setpoint
  };

  postData = extend(postData, newArgs);
  console.log('newArgs: ' + util.inspect(newArgs));
  console.log('postData: ' + util.inspect(postData));
  var args = {
    data: postData,
    headers: {
      "Authorization": "Bearer " + this._bearer,
      "Content-Type": "application/json",
      "Content-Length": JSON.stringify(postData).length
    }
  };


  console.log('newArgs: ' + util.inspect(newArgs));
  console.log('args: ' + util.inspect(args));
  var thermostatsURL ="https://api.honeywell.com/v2/devices/thermostats/" + this.deviceID + "?apikey=" + this._apiKey + "&locationId=" + this.locationID;
  console.log('thermostatsURL: ' + thermostatsURL); 
  this._lyricAPI.post(thermostatsURL, args, function (data, response) {
    // parsed response body as js object
    console.log('response.statusCode: ' + response.statusCode);
    console.log('api data: ' + util.inspect(data));
    console.log('api response: ' + util.inspect(response));
    if (response.statusCode === 200){ 
      cb();
    }
  });
}

Thermostat.prototype._syncState = function() {
  var self = this;
  this._lyricAPI.get(this._opts.devicesURL, this._opts.args, function (data, response) {
    console.log('3');
    console.log(util.inspect(data));
    console.log('4');
    if (data.length > 0 ) {
      var properties = Object.keys(data[0]);
      for (i=0; i<properties.length; i++) {
        self[properties[i]] = data[0][properties[i]];
      }

      self.setpoint = self.coolSetpoint = self.heatSetpoint;

      self.mode = data[0].changeableValues.mode;
      self.state = self._stateFromMode(self.mode);
      self.autoChangeoverActive = data[0].changeableValues.autoChangeoverActive;
      self.heatSetpoint = data[0].changeableValues.heatSetpoint;
      self.coolSetpoint = data[0].changeableValues.coolSetpoint; 
    }
  });
}

Thermostat.prototype._stateFromMode = function(mode) {
  var state = 'off';
  switch (mode) {
  case 'Cool':
    state = 'cooling';
    break;
  case 'Heat':
    state = 'heating';
    break;
  }
  return state;
}