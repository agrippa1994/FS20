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
var ERROR_NO_HOUSE_FOR_ID = 1003;
var ERROR_INVALID_DEVICE = 1004;

//--------------------------------------------------------------------------------------
// Read and parse configuration file
var config = {};
try {
	config = JSON.parse(fs.readFileSync("config.json"));
} catch(e) {
	console.log("Error while reading configuration file: " + e);
	process.exit(1);
}

//--------------------------------------------------------------------------------------
// Create MySQL connection
var mysqlConnection = mysql.createConnection(config.mysqlData);

mysqlConnection.connect(function(error){
	if(error) {
		console.log("Error while connecting to the main database: " + error);
		process.exit(1);
	}
	console.log("Connection to the database was successfull");
});

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

fs20.device.open(function(error) {
	if(error) {
		console.log("Error while opening the serial interface: " + error);
		process.exit(1);
	}

	console.log("Serial interface opened!");
});

//--------------------------------------------------------------------------------------
// Create express server
var app = express();

// Parse application/json
app.use(bodyParser.json());

// Middleware function for all requests
app.use(function(req, res, next) {
	res.setHeader("Content-Type", "application/json");
	res.sendObject = function(obj) {
		this.end(JSON.stringify(obj));
	};
	res.sendError = function(code, msg) {
		this.sendObject({ error: {code: code, msg: msg }});
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
app.post("/", function(req, res) {
	res.sendObject({x: req.validJSON({"a": "number", "b": "string"})});
});

app.get("/house", function(req, res) {
	mysqlConnection.query("SELECT * FROM house", function(err, rows) {
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
		res.sendObject(rows);
	});
});

app.post("/house", function(req, res) {
	if(req.validateJSONAndSendError({ "name": "string", "house_code_1": "number", "house_code_2": "number" }))
		return;

	if(!fs20.isValidCode(req.body.house_code_1) || !fs20.isValidCode(req.body.house_code_2))
		return res.sendError(ERROR_BAD_FS20_CODE, "Bad FS20 code!");

	var insertValues = [req.body.name, req.body.house_code_1, req.body.house_code_2];
	mysqlConnection.query("INSERT INTO house (name, house_code_1, house_code_2) VALUES (?, ?, ?)", insertValues, function(err, result) {
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
		res.sendObject({ id: result.insertId });
	});
});

app.get("/house/:house_id/device", function(req, res) {
	mysqlConnection.query("SELECT * FROM device WHERE house_id = ?", [req.params.house_id], function(err, rows){
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
		res.sendObject(rows);
	});
});

app.post("/house/:house_id/device", function(req, res) {
	if(req.validateJSONAndSendError({ "name": "string", "device_code": "number" }))
		return;

	if(!fs20.isValidCode(req.body.device_code))
		return res.sendError(ERROR_BAD_FS20_CODE, "Bad FS20 code!");

	mysqlConnection.query("SELECT * FROM house WHERE id = ?", [req.params.house_id], function(err, rows) {
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");

		if(rows.length === 0)
			return res.sendError(ERROR_NO_HOUSE_FOR_ID, "No house for the given id!");

		var insertValues = [req.params.house_id, req.body.name, req.body.device_code];
		mysqlConnection.query("INSERT INTO device (house_id, name, device_code) VALUES (?, ?, ?)", insertValues, function(err, result) {
			if(err)
				return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
			res.sendObject({ id: result.insertId });
		});
	});
});

app.get("/house/:house_id/device/:device_id/enable", function(req, res) {

	var sqlArgs = [req.params.house_id, req.params.device_id];
	mysqlConnection.query("SELECT * FROM house INNER JOIN device WHERE house.id = ? AND device.id = ?", sqlArgs, function(err, rows) {
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");

		if(rows.length === 0)
			return res.sendError(ERROR_INVALID_DEVICE, "No device found!");

		// TODO: Send FS20 commands here
		res.sendObject({test: "success"});
	});
});

app.get("/house/:house_id/device/:device_id/disable", function(req, res) {

	var sqlArgs = [req.params.house_id, req.params.device_id];
	mysqlConnection.query("SELECT * FROM house INNER JOIN device WHERE house.id = ? AND device.id = ?", sqlArgs, function(err, rows) {
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");

		if(rows.length === 0)
			return res.sendError(ERROR_INVALID_DEVICE, "No device found!");

		// TODO: Send FS20 commands here
		res.sendObject({test: "success"});
	});
});

app.get(["/web/:file", "/web"], function(req, res) {
	var file = req.params.file || "index.html";
	res.sendFile(__dirname + "/web/" + file, function(err) {
		if(err) {
			res.sendStatus(err.status);
		}
	});
});

app.listen(config.web.port);
