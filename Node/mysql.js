var mysql = require("mysql");

module.exports = function(config, connectHandler, automaticallyPing, pingHandler) {
	// Create MySQL connection
	this.connection = mysql.createConnection(config);
	this.connection.connect(connectHandler);
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
	
	this.queryRooms = function(handler) {
		this.connection.query("SELECT * FROM room", function(err, rows) {
			handler(err == null, rows);
		});
	}
	
	this.insertRoom = function(name, code1, code2, handler) {
		this.connection.query("INSERT INTO room (name, room_code_1, room_code_2) VALUES (?, ?, ?)",
			[name, code1, code2], 
			function(error, result) {
				handler(error == null, result.insertId);
			}
		);
	}
	
	this.queryRoom = function(roomID, handler) {
		this.queryAll(function(success, rooms) {
			if(!success)
				return handler(false, {});
				
			for(var i = 0; i < rooms.length; i++)
				if(rooms[i].id == roomID)
					return handler(true, rooms[i]);
			
			handler(false, {});
		});
	}
	
	this.updateRoom = function(roomID, newValues, handler) {
		this.connection.query("UPDATE room SET ? WHERE id = ?", [newValues, roomID], 
			function(err, result) {
				if(err)
					return handler(false);
			
				if(result.affectedRows === 0)
					return handler(false);
			
				handler(true);
    		}
		);
	}
	
	this.deleteRoom = function(roomID, handler) {
		this.connection.query("DELETE FROM room WHERE id = ?", [roomID],
			function(error, result) {
				if(error)
					return handler(false);
			
				if(result.affectedRows === 0)
					return handler(false);
			
				handler(true);		
			}
		);
	}
};
