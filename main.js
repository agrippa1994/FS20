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

var light = {
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








// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
var lightUUID = hap.uuid.generate('hap-nodejs:accessories:light');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var light = new hap.Accessory('Light', lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
light.username = "1A:2B:3C:4D:5E:FF";
light.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
light
  .getService(hap.Service.AccessoryInformation)
  .setCharacteristic(hap.Characteristic.Manufacturer, "Oltica")
  .setCharacteristic(hap.Characteristic.Model, "Rev-1")
  .setCharacteristic(hap.Characteristic.SerialNumber, "A1S2NASF88EW");

// listen for the "identify" event for this Accessory
light.on('identify', function(paired, callback) {
  //FAKE_LIGHT.identify();
  callback(); // success
});

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(hap.Service.Lightbulb, "Fake Light") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(hap.Characteristic.On)
  .on('set', function(value, callback) {
    //FAKE_LIGHT.setPowerOn(value);
    callback(); // Our fake Light is synchronous - this value has been successfully set
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
light
  .getService(hap.Service.Lightbulb)
  .getCharacteristic(hap.Characteristic.On)
  .on('get', function(callback) {
    
    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.
    
    var err = null; // in case there were any problems
    
    if (FAKE_LIGHT.powerOn) {
      console.log("Are we on? Yes.");
      callback(err, true);
    }
    else {
      console.log("Are we on? No.");
      callback(err, false);
    }
  });

// also add an "optional" Characteristic for Brightness
light
  .getService(hap.Service.Lightbulb)
  .addCharacteristic(hap.Characteristic.Brightness)
  .on('get', function(callback) {
    callback(null, FAKE_LIGHT.brightness);
  })
  .on('set', function(value, callback) {
    //FAKE_LIGHT.setBrightness(value);
    callback();
});

light.publish({ port: 51826, username: light.username, pincode: light.pincode });