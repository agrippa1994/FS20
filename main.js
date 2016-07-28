const errorCodes = require("./errorCodes.js");
const FS20 = require("./fs20.js");
const logger = require("./logger.js");
const fs = require("fs");
const hap = require("hap-nodejs");

//--------------------------------------------------------------------------------------
// Read and parse configuration file
var config = {};
try {
	config = JSON.parse(fs.readFileSync("config.json"));
} catch(e) {
	logger.error("Error while reading configuration file: " + e);
	process.exit(0);
}

// Adjust config
config.serialInterface.simulate = config.serialInterface.simulate || false;

//--------------------------------------------------------------------------------------
// Connection to the FS20 serial interface
logger.info("Connection to device '" + config.serialInterface.dev + "' with the baudrate '" + config.serialInterface.baud + "' is built ...");
logger.info("Using serial connection simulation mode " + config.serialInterface.simulate);

var fs20 = new FS20(
	config.serialInterface.dev, 
	config.serialInterface.baud, 
	config.serialInterface.simulate,
	function(error) {
		if(error) {
			logger.error("Failed to connect to the serial interface, " + error);
			process.exit(0);
		}
		
		logger.info("Connection to the serial interface has been established");
	},
	function(error) {
		logger.error("Serial connection disconnected");
		process.exit(0);
	}
);

hap.init("hap-db");

var FAKE_LIGHT = {
  powerOn: false,
  brightness: 100, // percentage
  
  setPowerOn: function(on) { 
    console.log("Turning the light %s!", on ? "on" : "off");
    light.powerOn = on;
  },
  setBrightness: function(brightness) {
    console.log("Setting light brightness to %s", brightness);
    light.brightness = brightness;
  },
  identify: function() {
    console.log("Identify the light!");
  }
};

var light = new hap.Accessory('Light', hap.uuid.generate('hap-nodejs:accessories:light'));
var fan = new hap.Accessory('Ventilator', hap.uuid.generate('hap-nodejs:accessories:fan'));

light
  .getService(hap.Service.AccessoryInformation)
  .setCharacteristic(hap.Characteristic.Manufacturer, "Oltica")
  .setCharacteristic(hap.Characteristic.Model, "Rev-1")
  .setCharacteristic(hap.Characteristic.SerialNumber, "A1S2NASF88EW");

fan
  .getService(hap.Service.AccessoryInformation)
  .setCharacteristic(hap.Characteristic.Manufacturer, "Oltica")
  .setCharacteristic(hap.Characteristic.Model, "Rev-1")
  .setCharacteristic(hap.Characteristic.SerialNumber, "A1S2NASF88EX");

light.on('identify', function(paired, callback) {
  callback(); // success
});

fan.on('identify', function(paired, callback) {
  callback(); // success
});

light
  .addService(hap.Service.Lightbulb, "Licht")
  .getCharacteristic(hap.Characteristic.On)
  .on('set', function(value, callback) {

    logger.info("Device state: " + value);
    fs20.setDeviceState(255, 0, 1, value, function() {
      callback();
    });
});

fan
  .addService(hap.Service.Fan, "Ventilator")
  .getCharacteristic(hap.Characteristic.On)
  .on('set', function(value, callback) {

    logger.info("Device state: " + value);
    fs20.setDeviceState(255, 0, 2, value, function() {
      callback();
    });
});

light.publish({ port: 51826, username: "1A:2B:3C:4D:5E:FF", pincode: "031-45-154" });
fan.publish({ port: 51827, username: "1A:2B:3C:4D:5F:FF", pincode: "031-45-155" });