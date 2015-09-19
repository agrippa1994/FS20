/* global __dirname */
/* global util */
/* global bodyParser */
/* global process */
/* global fs */
//--------------------------------------------------------------------------------------
// These libraries can be downloaded via npm ("npm install express mysql rwlock serialport body-parser")
var express = require("express"),
	mysql = require("mysql"),
	rwlock = require("rwlock"),
	serialPort = require("serialport")
	bodyParser = require("body-parser"),
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

//--------------------------------------------------------------------------------------
// Create MySQL connection
var mysqlConnection = mysql.createConnection(config.mysqlData);

mysqlConnection.connect(function(error){
	if(error) {
		println("Error while connecting to the main database: " + error);
		process.exit(1);
	}
	println("Connection to the database was successfull!");
});

setInterval(function() {
	mysqlConnection.ping(function(err) {
		if(err)
			println("Error while pinging mysql database: " + err);
	});
}, 2000);

//--------------------------------------------------------------------------------------
// Connection to the FS20 serial interface
function fs20(data, callback) {
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
		//println("Error while opening the serial interface: " + error);
		//process.exit(1);
	}

	println("Serial interface opened!");
});

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

// Router for the HTTP application
app.get("/api/room", function(req, res) {
	mysqlConnection.query("SELECT * FROM room", function(err, rows) {
		res.sendObject(rows);
	});
});

app.get("/api/", function(req, res) {
	var queryStr = "SELECT room.id as room_id, room.name as room_name, room.room_code_1 as rc1, room.room_code_2 as rc2, device.id as device_id, device.name as device_name, device.device_code, device.room_id as device_room_id FROM room INNER JOIN device";
	mysqlConnection.query(queryStr, function(err, rows) {
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");

		var rooms = [];
		rows.forEach(function(device){
			var roomIndex = -1;
			var isRoomInArray = rooms.some(function(room, index) {
				if(device.room_id === room.id) {
					roomIndex = index;
					return true;
				}
				return false;
			});

			if(!isRoomInArray) {
				roomIndex = rooms.push({ 
					id: device.room_id,
					name: device.room_name,
					code1: device.rc1,
					code2: device.rc2,
					devices: []
				}) - 1;
			}

			rooms[roomIndex].devices.push({ 
				id: device.device_id,
				name: device.device_name,
				code: device.device_code
			});
		});

		res.sendObject(rooms);
	});
});

app.get("/api/room", function(req, res) {
    mysqlConnection.query("SELECT * FROM room", function(err, rows){
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
		res.sendObject(rows);
	});
});

app.post("/api/room", function(req, res) {
	if(req.validateJSONAndSendError({ "name": "string", "room_code_1": "number", "room_code_2": "number" }))
		return;

	if(!fs20.isValidCode(req.body.room_code_1) || !fs20.isValidCode(req.body.room_code_2))
		return res.sendError(ERROR_BAD_FS20_CODE, "Bad FS20 code!");

	var insertValues = [req.body.name, req.body.room_code_1, req.body.room_code_2];
	mysqlConnection.query("INSERT INTO room (name, room_code_1, room_code_2) VALUES (?, ?, ?)", insertValues, function(err, result) {
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
		res.sendObject({ id: result.insertId });
	});
});

app.get("/api/room/:room_id", function(req, res) {
    mysqlConnection.query("SELECT * FROM room WHERE id = ?", [req.params.room_id], function(err, rows){
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
        
        if(rows.length === 0)
			return res.sendError(ERROR_NO_MYSQL_RESOURCE, "No room for the given id!");
        
		res.sendObject(rows[0]);
	});
});

app.post("/api/room/:room_id", function(req, res) {
    if(req.validateJSONAndSendError({ "name": "string", "room_code_1": "number", "room_code_2": "number" }))
		return;
    
    if(!fs20.isValidCode(req.body.room_code_1) || !fs20.isValidCode(req.body.room_code_2))
		return res.sendError(ERROR_BAD_FS20_CODE, "Bad FS20 code!");
    
    var updateValues = [req.body.name, req.body.room_code_1, req.body.room_code_2, req.params.room_id];
    mysqlConnection.query("UPDATE room SET name = ?, room_code_1 = ?, room_code_2 = ? WHERE id = ?", updateValues, function(err, result) {
        if(err)
            return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
        
        if(result.affectedRows === 0)
            return res.sendError(ERROR_NO_MYSQL_RESOURCE, "Nothing has been updated!");
        
        res.sendObject({ id: req.params.room_id });
    });
});

app.delete("/api/room/:room_id", function(req, res) {
    mysqlConnection.query("DELETE FROM room WHERE id = ?", [req.params.room_id], function(err, result) {
        if(err)
            return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
        
        if(result.affectedRows === 0)
            return res.sendError(ERROR_NO_MYSQL_RESOURCE, "Nothing has been deleted!");
            
        mysqlConnection.query("DELETE FROM device WHERE room_id = ?", [req.params.room_id], function(err, result) {
            if(err)
                return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
            
            return res.sendObject({ id: req.params.room_id });
        });
    });
});

app.get("/api/room/:room_id/device", function(req, res) {
	mysqlConnection.query("SELECT * FROM device WHERE room_id = ?", [req.params.room_id], function(err, rows){
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
		res.sendObject(rows);
	});
});

app.post("/api/room/:room_id/device", function(req, res) {
	if(req.validateJSONAndSendError({ "name": "string", "device_code": "number" }))
		return;

	if(!fs20.isValidCode(req.body.device_code))
		return res.sendError(ERROR_BAD_FS20_CODE, "Bad FS20 code!");

	mysqlConnection.query("SELECT * FROM room WHERE id = ?", [req.params.room_id], function(err, rows) {
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");

		if(rows.length === 0)
			return res.sendError(ERROR_NO_MYSQL_RESOURCE, "No room for the given id!");

        var insertValues = [req.params.room_id, req.body.name, req.body.device_code];
        mysqlConnection.query("INSERT INTO device (room_id, name, device_code) VALUES (?, ?, ?)", insertValues, function(err, result) {
            if(err)
                return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
            res.sendObject({ id: result.insertId });
        });
	});
});

app.get("/api/room/:room_id/device/:device_id", function(req, res) {
    mysqlConnection.query("SELECT * FROM device WHERE room_id = ? AND id = ?", [req.params.room_id, req.params.device_id], function(err, rows){
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
        
        if(rows.length === 0)
			return res.sendError(ERROR_NO_MYSQL_RESOURCE, "No room for the given id!");
        
		res.sendObject(rows[0]);
	});
});

app.post("/api/room/:room_id/device/:device_id", function(req, res) {
    if(req.validateJSONAndSendError({ "name": "string", "device_code": "number" }))
		return;

	if(!fs20.isValidCode(req.body.device_code))
		return res.sendError(ERROR_BAD_FS20_CODE, "Bad FS20 code!");

    var updateValues = [req.body.name, req.body.device_code, req.params.room_id, req.params.device_id];
    mysqlConnection.query("UPDATE device SET name = ?, device_code = ? WHERE room_id = ? AND id = ?", updateValues, function(err, result) {
        if(err)
            return res.sendError(ERROR_MYSQL_ERROR, "Database error!");

        if(result.affectedRows === 0)
            return res.sendError(ERROR_NO_MYSQL_RESOURCE, "Nothing has been updated!");

        res.sendObject({ id: req.params.device_id });
    });   
});

app.delete("/api/room/:room_id/device/:device_id", function(req, res) {
    mysqlConnection.query("DELETE FROM device WHERE room_id = ? AND id = ?", [req.params.room_id, req.params.device_id], function(err, rows) {
        if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
        
        if(rows.length === 0)
            return res.sendError(ERROR_MYSQL_DELETION_FAILED, "Device not found!");
        
        return res.sendObject({ deleteCount: rows.length });
    });
});

app.get("/api/room/:room_id/device/:device_id/:command", function(req, res) {
	var command = req.params.command;

	// Check, if :command is valid
	if(command != "enable" && command != "disable")
		return res.sendError(ERROR_INVALID_COMMAND, "Invalid command. Valid commands: enable | disable");

	var sqlArgs = [req.params.room_id, req.params.device_id];
	mysqlConnection.query("SELECT * FROM room INNER JOIN device WHERE room.id = ? AND device.id = ?", sqlArgs, function(err, rows) {
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");

		// Check if the requested device exists
		if(rows.length === 0)
			return res.sendError(ERROR_NO_MYSQL_RESOURCE, "No device found!");

		// Convert the codes into FS20 codes, e.g. 1111 --> 0x00, 1112 --> 0x01
		var rc1 = fs20.convertCode(rows[0].room_code_1),
			rc2 = fs20.convertCode(rows[0].room_code_2),
			dc = fs20.convertCode(rows[0].device_code)
		;

		// Map the command to the fs20 appropriate BEF byte
		var commandByte = {
			"enable": 0x11,
			"disable": 0x00
		} [command];

		// Check if the codes are valid
		if(rc1 == -1 || rc2 == -1 || dc == -1)
			return res.sendError(ERROR_BAD_FS20_CODE, "Bad FS20 code!");

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
				return res.sendError(ERROR_BAD_FS20_EXECUTION, "Bad FS20 command execution!");

			// Check if the exitcode is valid
			if(data[2] < 0x00 || data[2] > 0x09)
				return res.sendError(ERROR_BAD_FS20_EXECUTION, "Bad FS20 command execution!");
			
			// Send the exitcode and its appropriate exitcode text
			res.sendObject({ exitCode: data[2], exitText: FS20_EXIT_CODES_TEXT[data[2]] });
		});
	});
});

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
