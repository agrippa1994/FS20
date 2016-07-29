const ReadWriteLock = require("rwlock");
const SerialPort = require("serialport");
	
const FS20_EXIT_CODES_TEXT = [
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
	
	const serialSettings = {
		baudrate: baudrate,
		parser: SerialPort.parsers.byteLength(4),
		disconnectedCallback: disconnectHandler,
		autoOpen: false
	};
	
	function internalConnectHandler(error) {
		if(error && isSimulating)
			return connectHandler(null);
			
		connectHandler(error);
	}
	
	function setDeviceState(code, enable, callback) {
		if(that.simulating) {
			const exitCode = Math.floor(Math.random() * 10);
			return callback(null, { code: exitCode, text: FS20_EXIT_CODES_TEXT[exitCode] || ""  });
		}
		
		const binaryData = [
			0x02, // Start Opcode 
			0x06, // Command length
			0xF1, // Enable / Disable device
			code >> 16 & 0xFF, // Room code 1
			code >> 8 & 0xFF, // Room code 2
			code & 0xFF, // Device code
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
	this.device = new SerialPort(deviceName, serialSettings);
	this.mutex = new ReadWriteLock ();
	this.setDeviceState = setDeviceState;
	this.device.open(internalConnectHandler);
}

module.exports = FS20;
