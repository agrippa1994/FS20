const FS20 = require("./fs20.js");
const logger = require("./logger.js");
const fs = require("fs");
const hap = require("hap-nodejs");
const path = require("path");

//--------------------------------------------------------------------------------------
// Read and parse configuration file
var config = {};
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")));
} catch (e) {
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
  function (error) {
    if (error) {
      logger.error("Failed to connect to the serial interface, " + error);
      process.exit(0);
    }

    logger.info("Connection to the serial interface has been established");
  },
  function (error) {
    logger.error("Serial connection disconnected");
    process.exit(0);
  }
);

//--------------------------------------------------------------------------------------
// Initialize HAP
hap.init(path.join(__dirname, "hap-db"));

// Read all devices
var devices = hap.AccessoryLoader.loadDirectory(path.join(__dirname, "devices"));
var targetPort = 51826;

// Iterate through all devices
devices.forEach(device => {
  device.stateChange = (value, callback) => {
    logger.info(`Changing state of device ${device.username} to ${value} ...`);
    fs20.setDeviceState(device.code, value, (error, received) => {
      if (error)
        logger.error(`Can't change state of device ${device.username} to ${value}, ${error}`);
      else
        logger.info(`Changed state of device ${device.username} to ${value}, code: ${received.code}, text: ${received.text}`);

      if (error)
        callback("Error");
      else
        callback();
    });
  };

  device.publish({
    port: targetPort++,
    username: device.username,
    pincode: device.pincode
  });
});
