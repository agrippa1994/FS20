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
