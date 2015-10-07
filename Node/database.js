/*
	Structure of the database
	
	[{
		name: "Test"
		code1: 0xFF,
		code2: 0x00,
		devices: [{
			name: "Test",
			code: 0xAA,
			timeout: {
				time: 120.0,
				operation: true
			},
			timers: [{
				days: 127,
				time: "18:00",
				operation: true
			}]
		}
	}]
*/

var fs = require("fs");
var errorCodes = require("./errorCodes.js");

var data =[];

// ============================================================================
// Utils
function throwError(code) {
	throw { code: code, message: errorCodes.messages[code] || "" };	
}

function checkRequiredValue(val, type) {
	if(typeof val != type)
		throw "Type of '" + val + "' must be " + type;	
}

function checkOptionalValue(val, type) {
	if(typeof val === "undefined")
		return;
	
	checkRequiredValue(val, type);
}

// ============================================================================
// Rooms
function checkRoom(index) {
	if(index >= data.length)
		throwError(errorCodes.codes.DATABASE_TYPE_ERROR);
}

function checkRoomName(name) {
	for(var i = 0; i < data.length; i++)
		if(data[i].name == name)
			throwError(errorCodes.codes.DATABASE_ROOM_EXISTS);
}

function checkCode(code) {
	if(code < 0x00 || code > 0xFF)
		throwError(errorCodes.codes.DATABASE_INVALID_FS20_CODE);
}

function createRoom(name, code1, code2) {
	checkRequiredValue(name, "string");
	checkRequiredValue(code1, "number");
	checkRequiredValue(code2, "number");
	
	checkRoomName(name);
	checkCode(code1);
	checkCode(code2);
	
	data.push({ name: name, code1: code1, code2: code2, devices: [] });
	save();
}

function getRooms() {
	return copy(data);
}

function getRoom(index) {
	checkRoom(index);
	
	return copy(data[index]);
}

function updateRoomAt(index, name, code1, code2) {
	checkOptionalValue(index, "number");
	checkOptionalValue(name, "string");
	checkOptionalValue(code1, "number");
	checkOptionalValue(code2, "number");
	
	checkRoom(index);
	checkRoomName(name);
	
	data[index].name = name || data[index].name;
	data[index].code1 = code1 || data[index].code1;
	data[index].code2 = code2 || data[index].code2;
	save();
}

function deleteRoomAt(index) {
	checkRequiredValue(index, "number");
	
	checkRoom(index);
	
	data.splice(index, 1);
	save();
}

// ============================================================================
// Devices
function checkDeviceName(index, name) {
	for(var i = 0; i < data[index].devices.length; i++)
		if(data[index].devices[i].name == name)
			throwError(errorCodes.codes.DATABASE_DEVICE_EXISTS);
}

function checkDevice(roomIndex, deviceIndex) {
	checkRoom(roomIndex);
	
	if(deviceIndex >= data[roomIndex].devices.length)
		throwError(errorCodes.codes.DATABASE_NO_DEVICE_AT_INDEX);
}

function createDeviceAt(index, name, code) {
	checkRequiredValue(index, "number");
	checkRequiredValue(name, "string");
	checkRequiredValue(code, "number");
	
	checkRoom(index);
	checkDeviceName(index, name);
	checkCode(code);
	
	data[index].devices.push({name: name, code: code, timeout: {}, timers: [] });
	save();
}

function getDevices(roomIndex) {
	checkRoom(roomIndex);
	
	return copy(data[roomIndex].devices);
}

function getDevice(roomIndex, deviceIndex) {
	checkDevice(roomIndex, deviceIndex);
	
	return copy(data[roomIndex].device[deviceIndex]);
}

function updateDeviceAt(roomIndex, deviceIndex, name, code) {
	checkOptionalValue(roomIndex, "number");
	checkOptionalValue(deviceIndex, "number");
	checkOptionalValue(name, "string");
	checkOptionalValue(code, "number");
	
	checkDevice(roomIndex, deviceIndex);
	checkDeviceName(roomIndex, name);
	checkCode(code);
			
	data[roomIndex].device[deviceIndex].name = name || data[roomIndex].device[deviceIndex].name;
	data[roomIndex].device[deviceIndex].code = code || data[roomIndex].device[deviceIndex].code;
	save();
}

function deleteDeviceAt(roomIndex, deviceIndex) {
	checkRequiredValue(roomIndex, "number");
	checkRequiredValue(deviceIndex, "number");
	
	checkDevice(roomIndex, deviceIndex);
	
	data[roomIndex].device.splice(deviceIndex, 1);
	save();
}

// ============================================================================
// Timeouts
function setDeviceTimeoutAt(roomIndex, deviceIndex, timeoutIn, operation) {
	checkRequiredValue(roomIndex, "number");
	checkRequiredValue(deviceIndex, "number");
	checkRequiredValue(timeoutIn, "string");
	checkRequiredValue(operation, "number");
	
	checkDevice(roomIndex, deviceIndex);
	
	data[roomIndex].device[deviceIndex].timeout = { time: timeoutIn, operation: operation };
	save();
}

function getDeviceTimeoutAt(roomIndex, deviceIndex) {
	checkDevice(roomIndex, deviceIndex);
	
	var timeout = data[roomIndex].device[deviceIndex].timeout;
	if(!("time" in timeout && "operation" in timeout))
		throwError(errorCodes.codes.DATABASE_NO_TIMEOUT_SET);
		
	return copy(timeout);
}

function clearDeviceTimeoutAt(roomIndex, deviceIndex) {
	checkRequiredValue(roomIndex, "number");
	checkRequiredValue(deviceIndex, "number");
	
	checkDevice(roomIndex, deviceIndex);
	
	data[roomIndex].device[deviceIndex].timeout = {};
	save();
}

function copy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function load() {
	try {
		data = JSON.parse(fs.readFileSync("database.json"));
	} catch(e) {
		data = [];
		
		try {
			save();
		} catch(e) {
			
		}
	}
}

function save() {
	fs.writeFileSync("database.json", JSON.stringify(data, null, 4));
}

load();

module.exports = {
	// Rooms
	createRoom: createRoom,
	checkRoom: checkRoom,
	getRooms: getRooms,
	getRoom: getRoom,
	updateRoomAt: updateRoomAt,
	deleteRoomAt: deleteRoomAt,
	
	// Devices
	createDeviceAt: createDeviceAt,
	checkDevice: checkDevice,
	getDevices: getDevices,
	getDevice: getDevice,
	updateDeviceAt: updateDeviceAt,
	deleteDeviceAt: deleteDeviceAt,
	
	// Timeouts
	setDeviceTimeoutAt: setDeviceTimeoutAt,
	getDeviceTimeoutAt: getDeviceTimeoutAt,
	clearDeviceTimeoutAt: clearDeviceTimeoutAt
}
