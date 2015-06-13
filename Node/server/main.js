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
var WS_MSG_ID_INIT = 0;
var WS_MSG_ID_LOGIN = 1;

// Parse configuration file
var config = {};
try {
	config = JSON.parse(fs.readFileSync("./config.json"));
} catch(e) {
	console.log("Error while parsing configuration file: " + e);
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
	var json = {};
	try {
		json = JSON.parse(msg);
	} catch(e) {
		return client.sendObject({ error: "Sent message is not JSON formatted!"});
	}

	function sendErrorIfNotValid(id, key, type, error) {
		if(!(key in json)) {
			client.sendObject({ id: id, error: key + " was not provided or it has a wrong format!" });
			return true;
		}

		if(typeof json[key] != type) {
			client.sendObject({ id: id, error: key + " was not provided or it has a wrong format!" });
			return true;
		}

		return false;
	}


	if(sendErrorIfNotValid(-1, "id", "number"))
		return;

	if(json.id == WS_MSG_ID_INIT) {
		if(sendErrorIfNotValid(WS_MSG_ID_INIT, "type", "string"))
			return;

		if(json.type != "remote" && json.type != "fs20")
			return client.sendObject({ id: WS_MSG_ID_INIT, error: "type is neither 'remote' nor 'fs20'!" });

		client.isRemoteController = json.type == "remote";
		client.isFS20Controller = json.type == "fs20";
		client.isInitialized = true;
		return client.sendObject({ id: WS_MSG_ID_INIT, initialized: true });
	}

	if(json.id == WS_MSG_ID_LOGIN) {
		if(!client.isInitialized)
			return client.sendObject({ id: WS_MSG_ID_LOGIN, error: "You're not initialized!" });

		if(sendErrorIfNotValid(WS_MSG_ID_LOGIN, "name", "string") || sendErrorIfNotValid(WS_MSG_ID_LOGIN, "password", "string"))
			return;

		mysqlConnection.query("SELECT * FROM user WHERE name = ? AND password = SHA2(?, 256)", [json.name, json.password], function(err, rows) {
			if(err || rows.length === 0)
				return client.sendObject({ id: WS_MSG_ID_LOGIN, error: "Wrong username or password!" });

			client.sendObject({ id: WS_MSG_ID_LOGIN, loggedIn: true });
			client.isLoggedIn = true;
		});
	}

	return client.sendObject({ id: -1, error: "Unknown id!" });
}

for(var port = config.fs20Servers.ports.from; port <= config.fs20Servers.ports.to; port++) {
	servers.push(new fs20Server(mysqlConnection, port, fs20ServersMessageHandler));
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


