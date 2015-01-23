// -------------------------------------
// These libraries can be downloaded via npm ("npm install nodejs-websocket serialport rwlock")
var ws = require("nodejs-websocket");
var serialport = require("serialport");
var rwlock = require("rwlock");
//---------------------------------------
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

var connections = [];
var server = ws.createServer(function(conn){
	for(var i = 0;; i++) {
		if(typeof connections[i] == "undefined") {
			connections[i] = conn;
			conn.sender_id = i;
			break;
		}
	}

	conn.on("text", function(str) {
		try {
			sendToArduino(conn.sender_id, JSON.parse(str));
		} catch(e) {
			consoleLog("Connection " + conn.sender_id + " sent a wrong format " + e);
		}
	});

	conn.on("close", function(code, reason) {
		for(var i = 0;; i++) {
			if(typeof connections[i] == "object") {
				if(connections[i].sender_id == conn.sender_id) {
					connections.splice(i, 1);
					break;
				}
			}
		}
	});
}).listen(config.port);

var arduino = new serialport.SerialPort(config.dev, {
	baudrate: 115200,
	parser: serialport.parsers.readline("\r\n")
}, false);

arduino.open(function(error) {
	if(error) {
		consoleLog("Error while opening arduino: " + error);
		process.exit(0);
	}

	arduino.on("data", function(data) {
		try {
			var obj = JSON.parse(data);

			if(obj.id === 0)
			{
				consoleLog("Authentication success");
				sendToArduino(-1, {id: 0, params:[]});
			}

			else if(obj.id == 2 && obj.sender == -1)
				consoleLog("Log: " + obj.params[0]);
			else if(obj.sender == -1)
				consoleLog("Other: " + obj.params);

			if(obj.sender == -1 && obj.sender == -1) {
				for(var i = 0; i < connections.length; i++) {
					connections[i].sendText(data);
				}
			}
			else {
				for(var i = 0; i < connections.length; i++) {
					if(connections[i].sender_id == obj.sender) {
						connections[i].sendText(data);
					}
				}
			}
		} catch(e) {
			consoleLog("Arduino sent wrong data: " + e);
		}
	});
});

function sendToArduino(sender, obj) {

	if(typeof sendToArduino.lock == "undefined")
		sendToArduino.lock = new rwlock();

	if(typeof obj != "object")
		return false;

	setTimeout(function() {
		sendToArduino.lock.writeLock(function(release) {
			try {
				obj.sender = sender;
				var str = JSON.stringify(obj);

				arduino.write(str, function(error) {
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
