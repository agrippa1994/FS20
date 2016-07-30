const hap = require("hap-nodejs");

var device = new hap.Accessory('Steckdose2', hap.uuid.generate('hap-nodejs:accessories:steckdose2'));

device
  .getService(hap.Service.AccessoryInformation)
  .setCharacteristic(hap.Characteristic.Manufacturer, "FS20")
  .setCharacteristic(hap.Characteristic.Model, "Socket")
  .setCharacteristic(hap.Characteristic.SerialNumber, "None");

device.on('identify', function (paired, callback) {
  callback();
});

device
  .addService(hap.Service.Switch, "Steckdose2")
  .getCharacteristic(hap.Characteristic.On)
  .on('set', function (value, callback) {
    device.stateChange(value, callback);
  });

device.username = "00:00:00:00:00:04";
device.pincode = "000-00-004";
device.code = 0xFFFF04;

exports.accessory = device;
