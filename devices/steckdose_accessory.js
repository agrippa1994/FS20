const hap = require("hap-nodejs");

var device = new hap.Accessory('Steckdose', hap.uuid.generate('hap-nodejs:accessories:steckdose'));

device
  .getService(hap.Service.AccessoryInformation)
  .setCharacteristic(hap.Characteristic.Manufacturer, "FS20")
  .setCharacteristic(hap.Characteristic.Model, "Socket")
  .setCharacteristic(hap.Characteristic.SerialNumber, "None");

device.on('identify', function (paired, callback) {
  callback();
});

device
  .addService(hap.Service.Switch, "Steckdose")
  .getCharacteristic(hap.Characteristic.On)
  .on('set', function (value, callback) {
    device.stateChange(value, callback);
  });

device.username = "00:00:00:00:00:03";
device.pincode = "000-00-003";
device.code = 0xFFFF03;

exports.accessory = device;
