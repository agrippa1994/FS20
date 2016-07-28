var errorCodes = {
	DATABASE_TYPE_ERROR: 1000,
	DATABASE_NO_ROOM_AT_INDEX: 1001,
	DATABASE_ROOM_EXISTS: 1002,
	DATABASE_DEVICE_EXISTS: 1003,
	DATABASE_NO_DEVICE_AT_INDEX: 1004,
	DATABASE_NO_TIMEOUT_SET: 1005,
	
	INVALID_FS20_CODE: 1100,
};

var errorMessages = {
	1000: "Type error",
	1001: "No room at this index",
	1002: "Room already exist",
	1003: "Device alreay exist",
	1004: "No device at this index",
	1005: "No timeout set for this device",
	
	1100: "Invalid FS20 code"	
};

function createError(errorCode) {
	return { code: errorCode, message: errorMessages[errorCode] || "" };
}

function throwError(errorCode) {
	throw createError(errorCode);
}

module.exports = {
	codes: errorCodes,
	messages: errorMessages,
	throwError: throwError
};
