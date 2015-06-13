/*
	 +-------------------------+          +-----------------------+
	 | Main HTTP / HTTPS Server|          |FS20 WebSocket-Servers |
	 | (Used to provide ports) |          |                       |
	 |                         |          +---+-+----------+-+----+
	 +--+-----------------+----+              ^ |          ^ |     
	    ^                 ^                   | |          | |     
	    |  +----------------------------------+ |          | |     
	    |  |              |     +---------------+          | |     
	    |  |              |     |                          | |     
	+---+--+-+     +------+-----v---+                      | |     
	| Remote |     |FS20 Controller |                      | |     
	+---+----+     +---------+-----++                      | |     
	    ^                    |     |                       | |     
	    |                    |     |                       | |     
	    |                    |     +-----------------------+ |     
	    +----------------------------------------------------+     
	                         |                                     
	+-------------------+    |                                     
	|Light, Socket, ... | <--+                                     
	+-------------------+                                          
*/

var mysql = require("mysql");
var express = require("express");
var fs = require("fs");
var fs20Server = require("./fs20Server.js");

// Constants
var MAX_CLIENTS_PER_SERVER = 50;

// Parse configuration file
var config = {};
try {
	config = JSON.parse(fs.readFileSync("./config.json"));
} catch(e) {
	console.log("Error while parsing configuration file: " + e);
	process.exit(1);
}

// Create MySQL connection
var connection = mysql.createConnection(config.mysqlData);

connection.connect(function(error){
	if(error) {
		console.log("Error while connecting to the main database: " + error);
		process.exit(1);
	}
	console.log("Connection to the database was successfull");
});

// Configure main HTTP Server
var app = express();
app.get("/port", function(req, res) {
	res.send({ port: servers.freeServerPort() });
});

app.get("/servers", function(req, res) {
	var sendee = [];
	servers.forEach(function(obj) {
		sendee.push({ port: obj.port, clients: obj.clients.length });
	});

	res.send(sendee);
});

// Start main HTTP server
app.listen(config.fs20MainServer.port, function() {
	console.log("Main HTTP server has been started!");
});

// Start all FS20 servers (WebSocket)
var servers = [];
function fs20ServersMessageHandler(svr, client, msg) {

}

for(var port = config.fs20Servers.ports.from; port <= config.fs20Servers.ports.to; port++) {
	servers.push(new fs20Server(connection, port, fs20ServersMessageHandler));
}

servers.freeServerPort = function() {
	var that = this;

	if(that.length === 0)
		return -1;

	var min = MAX_CLIENTS_PER_SERVER;
	var port = -1;
	for(var i = that.length - 1; i >= 0; i--) {
		if(that[i].clients.length >= MAX_CLIENTS_PER_SERVER)
			continue;

		if(that[i].clients.length <= min) {
			port = that[i].port;
			min = that[i].clients.length;
		}
	}

	return port;
};


