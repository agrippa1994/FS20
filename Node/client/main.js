/*
// -------------------------------------
// These libraries can be downloaded via npm ("npm install serialport rwlock")
var serialport = require("serialport");
var rwlock = require("rwlock");
//---------------------------------------
var http = require("http");
var fs = require("fs");

var config = readConfiguration();

function consoleLog(str) {
	if(config.log)
		console.log(str);
}

function readConfiguration() {
	try {
		var f = fs.readFileSync("config.json");
		var conf = JSON.parse(f);

		if(!("port" in conf && "dev" in conf && "log" in conf))
			throw "Configuration is invalid";

		return conf;
	}
	catch(e) {
		console.log("Exception: " + e);
	}
}

http.createServer(function(request, response){
	request.on("data", function(chunk){
		sendToArduino(chunk);

		response.writeHead(200, "Success", {'Content-Type': 'application/json'});
		response.end();
	});
}).listen(config.port);

var arduino = new serialport.SerialPort(config.dev, {
	baudrate: 38400,
	parser: serialport.parsers.raw,
	buffersize: 1
}, false);

arduino.open(function(error) {

	if(error) {
		consoleLog("Error while opening Arduino: " + error);
		process.exit(0);
	}
});

function sendToArduino(buffer) {

	if(typeof sendToArduino.lock == "undefined")
		sendToArduino.lock = new rwlock();

	setTimeout(function() {
		sendToArduino.lock.writeLock(function(release) {
			try {
				arduino.write(buffer, function(error) {
					if(error) {
						consoleLog("Error while writing data " + error);
					}
					release();
				});
			}
			catch(e) {
				consoleLog(e);
			}
		});
	}, 1);
}
*/

var express = require("express"),
	mysql = require("mysql"),
	fs = require("fs"),
	bodyParser = require("body-parser"),
	util = require("util"),
	fs20Codes = require("./fs20Codes.js")
;

// Constants
var ERROR_CODE_INVALID_JSON = 1000;
var ERROR_MYSQL_ERROR = 1001;
var ERROR_BAD_FS20_CODE = 1002;
var ERROR_NO_HOUSE_FOR_ID = 1003;

// Read and parse configuration file
var config = {};
try {
	config = JSON.parse(fs.readFileSync("config.json"));
} catch(e) {
	console.log("Error while reading configuration file: " + e);
	process.exit(1);
}

// Create MySQL connection
var mysqlConnection = mysql.createConnection(config.mysqlData);

mysqlConnection.connect(function(error){
	if(error) {
		console.log("Error while connecting to the main database: " + error);
		process.exit(1);
	}
	console.log("Connection to the database was successfull");
});

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

	if(!fs20Codes.isValid(req.body.house_code_1) || !fs20Codes.isValid(req.body.house_code_2))
		return res.sendError(ERROR_BAD_FS20_CODE, "Bad FS20 code!");

	var insertValues = [req.body.name, req.body.house_code_1, req.body.house_code_2];
	mysqlConnection.query("INSERT INTO house (name, house_code_1, house_code_2) VALUES (?, ?, ?)", insertValues, function(err, result) {
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
		res.sendObject({ id: result.insertId });
	});
});

app.get("/device/:house_id", function(req, res) {
	mysqlConnection.query("SELECT * FROM device WHERE house_id = ?", [req.params.house_id], function(err, rows){
		if(err)
			return res.sendError(ERROR_MYSQL_ERROR, "Database error!");
		res.sendObject(rows);
	});
});

app.post("/device/:house_id", function(req, res) {
	if(req.validateJSONAndSendError({ "name": "string", "device_code": "number" }))
		return;

	if(!fs20Codes.isValid(req.body.device_code))
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
app.listen(3000);
