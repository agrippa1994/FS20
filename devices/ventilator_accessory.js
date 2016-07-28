const hap = require("hap-nodejs");

var device = new hap.Accessory('Ventilator', hap.uuid.generate('hap-nodejs:accessories:ventilator'));

device
  .getService(hap.Service.AccessoryInformation)
  .setCharacteristic(hap.Characteristic.Manufacturer, "Ventilator")
  .setCharacteristic(hap.Characteristic.Model, "unknown")
  .setCharacteristic(hap.Characteristic.SerialNumber, "None");

device.on('identify', function (paired, callback) {
  callback();
});

device
  .addService(hap.Service.Fan, "Ventilator")
  .getCharacteristic(hap.Characteristic.On)
  .on('set', function (value, callback) {
    device.stateChange(value, callback);
  });

device.username = "00:00:00:00:00:02";
device.pincode = "000-00-002";
device.code = 0xFFFF02;

exports.accessory = device;