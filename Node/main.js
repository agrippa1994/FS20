/* global __dirname */
/* global util */
/* global bodyParser */
/* global process */
/* global fs */
//--------------------------------------------------------------------------------------
// These libraries can be downloaded via npm ("npm install express rwlock serialport body-parser winston")

var express = require("express"),
	bodyParser = require("body-parser"),
	fs = require("fs"),
    bonjour = require("bonjour")(),
	database = require("./database.js"),
	rest = require("./rest.js"),
	errorCodes = require("./errorCodes.js"),
	FS20 = require("./fs20.js"),
	logger = require("./logger.js");

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

//--------------------------------------------------------------------------------------
// Create and initialize express server
var app = express();

// Parse application/json
app.use(bodyParser.json());

// Middleware function for all requests
app.use(function(req, res, next) {
	logger.info("Request from '" + req.ip + "' to resource '" + req.originalUrl + "'");
	
	res.finish = function(obj, code) {
		this.status(code || 200).end((typeof obj == "string") ? obj : JSON.stringify(obj));
	}
	
	next();
});

//--------------------------------------------------------------------------------------
// Custom routers
// /api/room/:roomID/device/:deviceID/(enable|disable)
app.get("/api/device/:deviceID/:command(enable|disable)", function(req, res) {
	var state = {
		"enable": true,
		"disable": false
	} [req.params.command] || false;
	
	
	database.device.findOne({ where: { id: req.params.deviceID}, include: database.room }).then(function(device) {
		if(device == null)
			return res.finish("No device", 400);
			
		if(device.room == null)
			return res.finish("This device isn't assigned to any room", 400);
			
		logger.info("Connection from '" + req.ip + "' attempts to set the device state of " + device.room.code1 + " " + device.room.code2 + " " + device.code + " to " + state);
		
		try {
			
			fs20.setDeviceState(device.room.code1, device.room.code2, device.code, state, function(error, exitCode) {
				if(error) {
					logger.error("FS20 request failed with error, " + error);
					return res.finish(error, 500);
				}
				
				if(exitCode.code == 0) {
					logger.info("FS20 request succeded with exitcode " + exitCode.code + ", " + exitCode.text);
					return res.finish(exitCode);
				}
	
				logger.warn("FS20 request failed with exitcode " + exitCode.code + ", " + exitCode.text);
				return res.finish(exitCode, 500);
				
			});
			
		}
		catch(e) {
			res.finish(e, 400);
		}
	});
});

// ============================================================================
// Create RESTful API
rest("/api", app);

// ============================================================================
// Create WWW
app.get("*", function(req, res) {
	res.sendFile(__dirname + "/web/" + (req.params["0"] || "index.html"), function(err) {
		if(err) {
			res.sendStatus(err.status);
		}
	});
});

// ============================================================================
// Start server
bonjour.unpublishAll();
try {
    bonjour.publish({
        name: "Zuhause",
        type: "fs20", 
        port: config.web.port,
        protocol: "tcp"
    });
	app.listen(config.web.port);
	logger.info("HTTP server has been successfully started!");
}
catch(e) {
	logger.error("Error while starting HTTP server: " + e);
	process.exit(0);
}
