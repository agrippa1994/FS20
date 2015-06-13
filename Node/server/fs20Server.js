var WebSocketServer = require("ws").Server;

module.exports = function(mySQL, port, messageHandler) {
	var socket = new WebSocketServer({ port: port });

	function configureClient(client) {
		// A remote controller is a device, which is used by the user itself to control the lights and so on.
		// The FS20 controller is used to control the FS20 sender module

		client.isRemoteController = false;
		client.isFS20Controller = false;
	}

	socket.on("connection", function(client) {
		configureClient(client);

		client.on("message", function(msg) {
			messageHandler(server, client, msg);
		});

		client.on("close", function() {
			console.log("close");
		});
	});

	return {
		socket: socket,
		port: port,
		clients: socket.clients
	};
};