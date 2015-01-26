// -------------------------------------
// These libraries can be downloaded via npm ("npm install nodejs-websocket serialport rwlock")
var ws = require("nodejs-websocket");
var serialport = require("serialport");
var rwlock = require("rwlock");
var http = require("http");
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
http.createServer(function(request, response){

	var postData = "";
	request.on("data", function(chunk){
		postData += chunk;
	});

	request.on("end", function() {
		for(var i = 0;; i++) {
			if(typeof connections[i] == "undefined") {
				connections[i] = response;
				response.sender_id = i;
				break;
			}
		}

		response.close = function() {
			for(var i = 0;; i++) {
				if(typeof connections[i] == "object") {
					if(connections[i].sender_id == this.sender_id) {
						connections.splice(i, 1);
						break;
					}
				}
			}
		};

		consoleLog("Incomming connection with data " + postData);

		try {
			sendToArduino(response.sender_id, JSON.parse(postData));
		} catch(e) {
			consoleLog("Connection " + response.sender_id + " sent a wrong format " + e);

			response.writeHead(404, "Failure", {'Content-Type': 'text/html'});
			response.end();
			response.close();
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

			for(var i = 0; i < connections.length; i++) {
				if(connections[i].sender_id == obj.sender) {
					connections[i].writeHead(200, "Success", {'Content-Type': 'text/html'});
					connections[i].end(data);
					connections[i].close();
					break;
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
