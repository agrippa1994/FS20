const hap = require("hap-nodejs");

var device = new hap.Accessory('Licht', hap.uuid.generate('hap-nodejs:accessories:licht'));

device
  .getService(hap.Service.AccessoryInformation)
  .setCharacteristic(hap.Characteristic.Manufacturer, "FS20")
  .setCharacteristic(hap.Characteristic.Model, "SU3")
  .setCharacteristic(hap.Characteristic.SerialNumber, "None");

device.on('identify', function (paired, callback) {
  callback();
});

device
  .addService(hap.Service.Lightbulb, "Licht")
  .getCharacteristic(hap.Characteristic.On)
  .on('set', function (value, callback) {
    device.stateChange(value, callback);
  });

device.username = "00:00:00:00:00:01";
device.pincode = "000-00-001";
device.code = 0xFFFF01;

exports.accessory = device;