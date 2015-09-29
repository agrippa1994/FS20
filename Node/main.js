/* global __dirname */
/* global util */
/* global bodyParser */
/* global process */
/* global fs */
//--------------------------------------------------------------------------------------
// These libraries can be downloaded via npm ("npm install express mysql rwlock serialport body-parser async")

var express = require("express"),
	mysql = require("./mysql.js"),
	database = require("./database.js"),
	errorCodes = require("./errorCodes.js"),
	rwlock = require("rwlock"),
	serialPort = require("serialport")
	bodyParser = require("body-parser"),
	async = require("async"),
	fs = require("fs"),
	util = require("util")
;

//--------------------------------------------------------------------------------------
// Constants
var ERROR_CODE_INVALID_JSON = 1000;
var ERROR_MYSQL_ERROR = 1001;
var ERROR_BAD_FS20_CODE = 1002;
var ERROR_NO_MYSQL_RESOURCE = 1003;
var ERROR_BAD_FS20_EXECUTION = 1004;
var ERROR_INVALID_COMMAND = 1005;
var ERROR_MYSQL_DELETION_FAILED = 1006;

var FS20_EXIT_CODES_TEXT = [
	/* 0x00 */ "Standby",
	/* 0x01 */ "Send Active",
	/* 0x02 */ "Invalid Command ID",
	/* 0x03 */ "Invalid Command Length",
	/* 0x04 */ "Invalid Parameters",
	/* 0x05 */ "Duty Cycle Active",
	/* 0x06 */ "Invalid Start Sign",
	/* 0x07 */ "Invalid FS20 Command",
	/* 0x08 */ "Too Slow Data Transmission",
	/* 0x09 */ "Pause was < 10ms"
];

//--------------------------------------------------------------------------------------
// println function for printing to console and to a log file
function println(text) {
	console.log(text);
	fs.appendFileSync("log.txt", text + "\n");
}

//--------------------------------------------------------------------------------------
// Read and parse configuration file
var config = {};
try {
	config = JSON.parse(fs.readFileSync("config.json"));
} catch(e) {
	println("Error while reading configuration file: " + e);
	process.exit(1);
}

// Adjust config
config.serialInterface.simulate = config.serialInterface.simulate || false;

//--------------------------------------------------------------------------------------
// Connection to the FS20 serial interface
function fs20(data, callback) {
	if(config.serialInterface.simulate == true) {
		return callback(null, [0x02, 0x02, Math.floor(Math.random() * 10), 0x04]);
	}
	
	if(typeof fs20.device === "undefined")
		return false;

	if(!fs20.device.isOpen())
		return false;

	if(typeof fs20.mutex === "undefined")
		fs20.mutex = new rwlock();

	fs20.mutex.writeLock(function(release) {
		fs20.device.write(data, function(err) {
			if(err) {
				release();
				return callback(err, null); 
			}

			fs20.device.on("data", function(recvData) {
				release();
				callback(null, recvData);
				fs20.device.removeAllListeners("data");
			});
		});
	});

	return true;
}

fs20.device = new serialPort.SerialPort(config.serialInterface.dev, {
	baudrate: config.serialInterface.baud,
	parser: serialPort.parsers.byteLength(4)
}, false);

fs20.isValidCode = function(code) {
	var c = parseInt(code);
	if(isNaN(c))
		return false;

	if(c < 1111 || c > 4444)
		return false;

	for(var i = 1; i <= 4; i++, c = Math.floor(c / 10))
		if(c % 10 < 1 || c % 10 > 4)
			return false;

	return true;
}

fs20.convertCode = function(code) {
	if(!fs20.isValidCode(code))
		return -1;

	for(var i = 1111, hex = 0x00; i<=4444; i++) {
		if(!fs20.isValidCode(i))
			continue;

		if(code == i)
			return hex;

		hex++;
	}

	return -1;
}

fs20.device.open(function(error) {
	if(error) {
		if(config.serialInterface.simulate == false) {
			println("Error while opening the serial interface: " + error);
			process.exit(1);
		}
	}

	println("Serial interface opened!");
});

function setDeviceStateInRoom(roomID, deviceID, state, callback) {
	var sqlArgs = [roomID, deviceID];
	mysqlConnection.query("SELECT * FROM room INNER JOIN device WHERE room.id = ? AND device.id = ?", sqlArgs, function(err, rows) {
		if(err)
			return callback("Database error!");
		
		// Check if the requested device exists
		if(rows.length === 0)
			return callback("No device found!");

		// Convert the codes into FS20 codes, e.g. 1111 --> 0x00, 1112 --> 0x01
		var rc1 = fs20.convertCode(rows[0].room_code_1),
			rc2 = fs20.convertCode(rows[0].room_code_2),
			dc = fs20.convertCode(rows[0].device_code);
			
		// Map the command to the fs20 appropriate BEF byte
		var commandByte = {
			true: 0x11,
			false: 0x00
		} [state] || true;

		// Check if the codes are valid
		if(rc1 == -1 || rc2 == -1 || dc == -1)
			return callback("Bad FS20 code!");

		// Execute the command on the FS20 module
		fs20([0x02, 0x06, 0xF1, rc1, rc2, dc, commandByte, 0x00], function(err, data) {
			/*
				The FS20's response should be 4 bytes long
				0: 0x2 (start opcode)
				1: 0x2 (length)
				2: exitcode (should be between 0x00 and 0x09)
				3: baudrate (should be between 0x00 and 0x04)
			*/
			// Check if an error occured and the response's length
			if(err || data.length != 4)
				return callback("Bad FS20 command execution!");

			// Check if the exitcode is valid
			if(data[2] < 0x00 || data[2] > 0x09)
				return callback("Bad FS20 command execution!");
			
			// Send the exitcode and its appropriate exitcode text
			callback(null, data[2]);
		});
	});
}

//--------------------------------------------------------------------------------------
// Process timeout-timer
/*
setInterval(function(){
	mysqlConnection.query("SELECT * FROM device", function(error, devices) {
		if(error) {
			println("An error occured while fetching devices from the database!");
			process.exit(1);
		}
		
		devices.forEach(function(device) {
			if(device.timeout_in_use) {
				var currentTime = new Date().getTime() / 1000;
				if(device.timeout_time <= currentTime) {
					setDeviceStateInRoom(device.room_id, device.id, device.timeout_operation >= 1, function(error, fs20RetVal) {
						if(error)
							return println("Error while processing FS20 request, " + error);
							
						println("FS20 execution on device '" + device.name + "' finished with return value '" + fs20RetVal + "' (" + FS20_EXIT_CODES_TEXT[fs20RetVal] + ")");
					});
					// Update MySQL
					var updateValues = [{timeout_in_use: 0, timeout_time: 0.0, timeout_operation: 0}];
					mysqlConnection.query("UPDATE device SET ?", updateValues, function(error) {
						if(error) {
							println("Error while updating mysql data base " + error);
							process.exit(1);
						}
					});
				}
			}
		});
	});
}, 1000);
*/
//--------------------------------------------------------------------------------------
// Create express server
var app = express();

// Parse application/json
app.use(bodyParser.json());

// Middleware function for all requests
app.use(function(req, res, next) {
	res.sendObject = function(obj) {
		res.setHeader("Content-Type", "application/json");
		this.end(JSON.stringify(obj));
	};

	res.sendError = function(code, msg) {
		res.setHeader("Content-Type", "application/json");
        this.status(400).send(JSON.stringify({ error: { code: code, msg: msg }}));
	};

	req.validJSON = function(members) {
		var that = this, error = false;
		Object.keys(members).forEach(function(key){
			if(!(key in that.body))
				error = true;

			if(!error && typeof that.body[key] != members[key])
				error = true;
		});

		return !error;
	};

	req.validateJSONAndSendError = function(members) {
		if(!this.validJSON(members)) {
			res.sendError(ERROR_CODE_INVALID_JSON, "Some keys weren't found or they've wrong data types!");
			return true;
		}

		return false;
	};

	next();
});


// ============================================================================
// /api/rooms
app.get("/api/rooms", function(req, res) {
	try {
		res.sendObject(database.getRooms());
	} catch(e) {
		res.sendError(0, e);
	}
});
	
app.post("/api/rooms", function(req, res) {
	try {
		database.createRoom(req.body.name, req.body.code1, req.body.code2);
		res.sendObject({success: true});
	} catch(e) {
		res.sendError(0, e);
	}
});


// ============================================================================
// /api/room/:roomID(\\d+)
app.get("/api/room/:roomID(\\d+)", function(req, res) {
	try {
		res.sendObject(database.getRoom(parseInt(req.params.roomID)));
	} catch(e) {
		res.sendError(0, e);
	}
});

app.post("/api/room/:roomID(\\d+)", function(req, res) {
	try {
		database.updateRoomAt(parseInt(req.params.roomID), req.body.name, req.body.code1, req.body.code2);
		res.sendObject({success: true});
	} catch(e) {
		res.sendError(0, e);
	}
});

app.delete("/api/room/:roomID(\\d+)", function(req, res) {
	try {
		database.deleteRoomAt(parseInt(req.params.roomID));
		res.sendObject({success: true});
	} catch(e) {
		res.sendError(0, e);
	}
});

// ============================================================================
// /api/room/:roomID/devices
app.get("/api/room/:roomID(\\d+)/devices", function(req, res) {
	try {
		res.sendObject(database.getDevices(parseInt(req.params.roomID)));
	} catch(e) {
		res.sendError(0, e);
	}
});

app.post("/api/room/:roomID(\\d+)/devices", function(req, res) {
	try {
		database.createDeviceAt(parseInt(req.params.roomID), req.body.name, req.body.code);
		res.sendObject({success: true});
	} catch(e) {
		res.sendError(0, e);
	}
});

// ============================================================================
// /api/room/:roomID/device/:deviceID
app.post("/api/room/:roomID(\\d+)/device/:deviceID(\\d+)", function(req, res) {
	try {
		res.sendObject(database.getDevice(parseInt(req.params.roomID), parseInt(req.params.deviceID)));
	} catch(e) {
		res.sendError(0, e);
	}
});

app.post("/api/room/:roomID(\\d+)/device/:deviceID(\\d+)", function(req, res) {
	try {
		database.updateDeviceAt(parseInt(req.params.roomID), parseInt(req.params.deviceID), req.body.name, req.body.code);
		res.sendObject({success: true});
	} catch(e) {
		res.sendError(0, e);
	}
});

app.delete("/api/room/:roomID(\\d+)/device/:deviceID(\\d+)", function(req, res) {
	try {
		database.deleteDeviceAt(parseInt(req.params.roomID), parseInt(req.params.deviceID));
		res.sendObject({success: true});
	} catch(e) {
		res.sendError(0, e);
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
	println("HTTP server has been successfully started!");
}
catch(e) {
	println("Error while starting HTTP server: " + e);
	process.exit(1);
}
