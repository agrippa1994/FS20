var errorCodes = {
	DATABASE_TYPE_ERROR: 1000,
	DATABASE_NO_ROOM_AT_INDEX: 1001,
	DATABASE_ROOM_EXISTS: 1002,
	DATABASE_INVALID_FS20_CODE: 1003,
	DATABASE_DEVICE_EXISTS: 1004,
	DATABASE_NO_DEVICE_AT_INDEX: 1005,
	DATABASE_NO_TIMEOUT_SET: 1006
};

var errorMessages = {
	1000: "Type error",
	1001: "No room at this index",
	1002: "Room already exist",
	1003: "Invalid FS20 code",
	1004: "Device alreay exist",
	1005: "No device at this index",
	1006: "No timeout set for this device"	
};

module.exports = {
	codes: errorCodes,
	messages: errorMessages
};
