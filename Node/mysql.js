var mysql = require("mysql");

function MySQLEntity(connection, tableName, id) {
	this.query = function(handler) {
		connection.query(
			"SELECT * FROM ??", 
			[tableName],
			function(error, rows) {
				console.log("Error: " + error);
				handler(error == null, rows);
			}
		);
	}
	
	this.insert = function(values, handler) {
		connection.query(
			"INSERT INTO ?? SET ?", 
			[tableName, values],
			function(error, result) {
				if(error)
					return handler(false, -1);
				handler(true, result.insertId);
			}
		);
	}
	
	this.update = function(at, newValues, handler) {
		connection.query(
			"UPDATE ?? SET ? WHERE ?? = ?",
			[tableName, newValues, id, at],
			function(error, result) {				
				if(error)
					return handler(false);

				if(result.affectedRows === 0)
					return handler(false);
					
				handler(true);
			}	
		);
	}
	
	this.delete = function(at, handler) {
		connection.query(
			"DELETE FROM ?? WHERE ?? = ?",
			[tableName, id, at],
			function(error, result) {
				if(error)
					return handler(false);
				if(result.affectedRows === 0)
					return handler(false);
					
				handler(true);
			}	
		);
	}
}

module.exports = function(config, connectHandler, automaticallyPing, pingHandler) {
	// Create MySQL connection
	this.connection = mysql.createConnection(config);
	this.connection.connect(connectHandler);
	this.rooms = new MySQLEntity(this.connection, "room", "id");
	this.devices = new MySQLEntity(this.connection, "device", "id");
	
	var that = this;
	
	// Create ping timer
	if(automaticallyPing) {
		setInterval(function() {
			that.connection.ping(pingHandler);
		}, 2000);
	}
	
	this.queryAll = function(handler) {
		var queryStr = "SELECT room.id as room_id, room.name as room_name, room.room_code_1 as rc1, room.room_code_2 as rc2, device.id as device_id, device.name as device_name, device.device_code, device.room_id as device_room_id FROM room INNER JOIN device";
		this.connection.query(queryStr, function(err, rows) {
			if(err)
				return handler(false, []);

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

			handler(true, rooms);
		});
	}
};
