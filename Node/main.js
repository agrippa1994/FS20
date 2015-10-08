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
	database = require("./database.js"),
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
	process.exit(1);
}

// Adjust config
config.serialInterface.simulate = config.serialInterface.simulate || false;

logger.info("Connection to device '" + config.serialInterface.dev + "' with the baudrate '" + config.serialInterface.baud + "' is built ...");
logger.info("Using serial connection simulation mode " + config.serialInterface.simulate);

//--------------------------------------------------------------------------------------
// Connection to the FS20 serial interface
var fs20 = new FS20(
	config.serialInterface.dev, 
	config.serialInterface.baud, 
	config.serialInterface.simulate,
	function(error) {
		if(error) {
			logger.error("Failed to connect to the serial interface, " + error);
			process.exit(1);
		}
		
		logger.info("Connection to the serial interface has been established");
	},
	function(error) {
		logger.error("Serial connection disconnected");
		process.exit(1);
	}
);

//--------------------------------------------------------------------------------------
// Create express server
var app = express();

// Parse application/json
app.use(bodyParser.json());

// Middleware function for all requests
app.use(function(req, res, next) {
	logger.info("Request from '" + req.ip + "' to resource '" + req.originalUrl + "'");
	
	res.sendObject = function(obj) {
		res.setHeader("Content-Type", "application/json");
		this.end(JSON.stringify(obj));
	};

	res.sendError = function(error) {
		res.setHeader("Content-Type", "application/json");
        this.status(400).send(JSON.stringify({ error: error }));
	};
	
	next();
});


// ============================================================================
// /api/rooms
app.get("/api/rooms", function(req, res) {
	try {
		res.sendObject(database.getRooms());
	} catch(e) {
		res.sendError(e);
	}
});
	
app.post("/api/rooms", function(req, res) {
	try {
		database.createRoom(req.body.name, req.body.code1, req.body.code2);
		res.sendObject({ success: true });
	} catch(e) {
		res.sendError(e);
	}
});


// ============================================================================
// /api/room/:roomID(\\d+)
app.get("/api/room/:roomID(\\d+)", function(req, res) {
	try {
		res.sendObject(database.getRoom(parseInt(req.params.roomID)));
	} catch(e) {
		res.sendError(e);
	}
});

app.post("/api/room/:roomID(\\d+)", function(req, res) {
	try {
		database.updateRoomAt(parseInt(req.params.roomID), req.body.name, req.body.code1, req.body.code2);
		res.sendObject({success: true});
	} catch(e) {
		res.sendError({ error: e });
	}
});

app.delete("/api/room/:roomID(\\d+)", function(req, res) {
	try {
		database.deleteRoomAt(parseInt(req.params.roomID));
		res.sendObject({success: true});
	} catch(e) {
		res.sendError(e);
	}
});

// ============================================================================
// /api/room/:roomID/devices
app.get("/api/room/:roomID(\\d+)/devices", function(req, res) {
	try {
		res.sendObject(database.getDevices(parseInt(req.params.roomID)));
	} catch(e) {
		res.sendError(e);
	}
});

app.post("/api/room/:roomID(\\d+)/devices", function(req, res) {
	try {
		database.createDeviceAt(parseInt(req.params.roomID), req.body.name, req.body.code);
		res.sendObject({ success: true });
	} catch(e) {
		res.sendError(e);
	}
});

// ============================================================================
// /api/room/:roomID/device/:deviceID
app.get("/api/room/:roomID(\\d+)/device/:deviceID(\\d+)", function(req, res) {
	try {
		res.sendObject(database.getDevice(parseInt(req.params.roomID), parseInt(req.params.deviceID)));
	} catch(e) {
		res.sendError(e);
	}
});

app.post("/api/room/:roomID(\\d+)/device/:deviceID(\\d+)", function(req, res) {
	try {
		database.updateDeviceAt(parseInt(req.params.roomID), parseInt(req.params.deviceID), req.body.name, req.body.code);
		res.sendObject({ success: true });
	} catch(e) {
		res.sendError(e);
	}
});

app.delete("/api/room/:roomID(\\d+)/device/:deviceID(\\d+)", function(req, res) {
	try {
		database.deleteDeviceAt(parseInt(req.params.roomID), parseInt(req.params.deviceID));
		res.sendObject({ success: true });
	} catch(e) {
		res.sendError(e);
	}
});

// ============================================================================
// /api/room/:roomID/device/:deviceID/(enable|disable)
app.get("/api/room/:roomID(\\d+)/device/:deviceID/:command(enable|disable)", function(req, res) {
	var state = {
		"enable": true,
		"disable": false
	} [req.params.command] || false;
	
	try {
		var room = database.getRoom(parseInt(req.params.roomID));
		var device = database.getDevice(parseInt(req.params.roomID), parseInt(req.params.deviceID));
		
		logger.info("Connection from '" + req.ip + "' attempts to set the device state of " + room.code1 + " " + room.code2 + " " + device.code + " to " + state);
		fs20.setDeviceState(room.code1, room.code2, device.code, state, function(error, exitCode) {
			if(error) {
				logger.error("FS20 request failed with error, " + error);
				return res.sendError(error);
			}
			
			if(exitCode.code == 0) {
				logger.info("FS20 request succeded with exitcode " + exitCode.code + ", " + exitCode.text);
				return res.sendObject(exitCode);
			}

			logger.warn("FS20 request failed with exitcode " + exitCode.code + ", " + exitCode.text);
			return res.sendError(exitCode);	
			
		});
	}
	
	catch(e) {
		res.sendError(e);
	}
});

// ============================================================================
// *
app.get("*", function(req, res) {
	res.sendFile(__dirname + "/web/" + (req.params["0"] || "index.html"), function(err) {
		if(err) {
			res.sendStatus(err.status);
		}
	});
});

try {
	app.listen(config.web.port);
	logger.info("HTTP server has been successfully started!");
}
catch(e) {
	logger.error("Error while starting HTTP server: " + e);
	process.exit(1);
}
