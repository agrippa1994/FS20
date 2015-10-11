var ReadWriteLock = require("rwlock"),
	SerialPort = require("serialport"),
	errorCodes = require("./errorCodes.js");
	
var FS20_EXIT_CODES_TEXT = [
	/* 0x00 */ "Standby",
	/* 0x01 */ "Send Active",
	/* 0x02 */ "Invalid Command ID",
	/* 0x03 */ "Invalid Command Length",
	/* 0x04 */ "Invalid Parameters",
	/* 0x05 */ "Duty Cycle Active",
	/* 0x06 */ "Invalid Start Sign",
	/* 0x07 */ "Invalid FS20 Command",
	/* 0x08 */ "Too Slow Data Transmission",
	/* 0x09 */ "Pause was < 10ms"
];

function FS20(deviceName, baudrate, isSimulating, connectHandler, disconnectHandler) {
	var that = this;
	
	var serialSettings = {
		baudrate: baudrate,
		parser: SerialPort.parsers.byteLength(4),
		disconnectedCallback: disconnectHandler
	};
	
	function internalConnectHandler(error) {
		if(error && isSimulating)
			return connectHandler(null);
			
		connectHandler(error);
	}
	
	function isValidCode(code) {
		if(typeof code !== "number")
			errorCodes.throwError(errorCodes.codes.INVALID_FS20_CODE);
			
		if(isNaN(code))
			errorCodes.throwError(errorCodes.codes.INVALID_FS20_CODE);
			
		if(code < 0x00 || code > 0xFF)
			errorCodes.throwError(errorCodes.codes.INVALID_FS20_CODE);
	}
	
	function setDeviceState(roomCode1, roomCode2, deviceCode, enable, callback) {
		[roomCode1, roomCode2, deviceCode].forEach(isValidCode);
		
		if(that.simulating) {
			var exitCode = Math.floor(Math.random() * 10);
			return callback(null, {code: exitCode, text: FS20_EXIT_CODES_TEXT[exitCode] || "" });
		}
		
		var binaryData = [
			0x02, // Start Opcode 
			0x06, // Command length
			0xF1, // Enable / Disable device
			roomCode1, // Room code 1
			roomCode2, // Room code 2
			deviceCode, // Device code
			enable ? 0x11 : 0x00, // Enable / Disable
			0x00 // Additional parameter
		];
		
		that.mutex.writeLock(function(release) {
			that.device.write(binaryData, function(err) {
				if(err) {
					release();
					return callback(err, null);
				}
				
				that.device.on("data", function(recvData) {
					release();
					
					var exitCode = recvData[2];
					callback(null, {code: exitCode, text: FS20_EXIT_CODES_TEXT[exitCode] || "Invalid Exit Code" });
					that.device.removeAllListeners("data");
				});
			});
			
		});
	}
	
	this.simulating = isSimulating || false;
	this.device = new SerialPort.SerialPort(deviceName, serialSettings, false);
	this.mutex = new ReadWriteLock ();
	this.setDeviceState = setDeviceState;
	this.device.open(internalConnectHandler);
}

module.exports = FS20;
