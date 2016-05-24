var util = require('util');
var extend = require('node.extend');

var IMAGE_URL_ROOT = 'http://www.zettaapi.org/icons/';
var IMAGE_EXTENSION = '.png';

var stateImageForDevice = function(device) {
  return IMAGE_URL_ROOT + device.type + '-' + device.state + IMAGE_EXTENSION;
}

module.exports = function(server) {
  ['thermostat'].forEach(function(deviceType){
    var deviceQuery = server.where({ type: deviceType});
    server.observe([deviceQuery], function(device) {
      var states = Object.keys(device._allowed);
      for (i = 0; i < states.length; i++) {
        device._allowed[states[i]].push('_update-state-image');
      }
      device._transitions['_update-state-image'] = {
        handler: function(updatedStateImage, cb) {
          device.style = extend(device.style, {});
          device.style.actions = {'_update-state-image': {display: 'none'}};
          device.style.properties = extend(device.style.properties, {stateImage: {url: updatedStateImage}});
          cb();
        },
        fields: [
          {name: 'image', type: 'text'}
        ]
      };

      device.call('_update-state-image', stateImageForDevice(device));
      var stateStream = device.createReadStream('state');
      stateStream.on('data', function(newState) {
        device.call('_update-state-image', stateImageForDevice(device));
      });
    });
  });
}