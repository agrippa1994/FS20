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

var data =[];

// ============================================================================
// Rooms
function checkRoom(index) {
	if(index >= data.length)
		throw "No room at this index";
}

function checkRoomName(name) {
	for(var i = 0; i < data.length; i++)
		if(data[i].name == name)
			throw "Room already exists";
}

function checkCode(code) {
	if(code < 0x00 || code > 0xFF)
		throw "Invalid FS20 code";
}

function createRoom(name, code1, code2) {
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
	checkRoom(index);
		
	for(var i = 0; i < data[index].devices.length; i++)
		if(data[index].devices.name == name)
			throw "Room with this name already exists";	
			
	data[index].name = name || data[index].name;
	data[index].code1 = code1 || data[index].code1;
	data[index].code2 = code2 || data[index].code2;
	save();
}

function deleteRoomAt(index) {
	checkRoom(index);
	
	data.splice(index, 1);
	save();
}

// ============================================================================
// Devices
function checkDeviceName(index, name) {
	for(var i = 0; i < data[index].devices.length; i++)
		if(data[index].devices.name == name)
			throw "Device already exists";
}

function checkDevice(roomIndex, deviceIndex) {
	checkRoom(roomIndex);
	
	if(deviceIndex >= data[roomIndex].devices.length)
		throw "Device doesn't exist";
}

function createDeviceAt(index, name, code) {
	checkRoom(index);
	checkDeviceName(name);
	checkCode(code);
	
	data[index].devices.push({name: name, code: code, timeout: {}, timers: [] });
	save();
}

function getDevices(roomIndex) {
	checkRoom(roomIndex);
	
	return copy(data[roomIndex].device);
}

function getDevice(roomIndex, deviceIndex) {
	checkDevice(roomIndex, deviceIndex);
	
	return copy(data[roomIndex].device[deviceIndex]);
}

function updateDeviceAt(roomIndex, deviceIndex, name, code) {
	checkDevice(roomIndex, deviceIndex);
	checkDeviceName(roomIndex, name);
	checkCode(code);
			
	data[roomIndex].device[deviceIndex].name = name || data[roomIndex].device[deviceIndex].name;
	data[roomIndex].device[deviceIndex].code = code || data[roomIndex].device[deviceIndex].code;
	save();
}

function deleteDeviceAt(roomIndex, deviceIndex) {
	checkDevice(roomIndex, deviceIndex);
	
	data[roomIndex].device.splice(deviceIndex, 1);
	save();
}

// ============================================================================
// Timeouts
function setDeviceTimeoutAt(roomIndex, deviceIndex, timeoutIn, operation) {
	checkDevice(roomIndex, deviceIndex);
	
	data[roomIndex].device[deviceIndex].timeout = { time: timeoutIn, operation: operation };
	save();
}

function getDeviceTimeoutAt(roomIndex, deviceIndex) {
	checkDevice(roomIndex, deviceIndex);
	
	var timeout = data[roomIndex].device[deviceIndex].timeout;
	if(!("time" in timeout && "operation" in timeout))
		throw "No timeout is set";
		
	return copy(timeout);
}

function clearDeviceTimeoutAt(roomIndex, deviceIndex) {
	checkDevice(roomIndex, deviceIndex);
	
	data[roomIndex].device[deviceIndex].timeout = {};
	save();
}

function copy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function load() {
	try {
		JSON.parse(fs.readFileSync("database.json"));
	} catch(e) {
		data = [];
		
		try {
			save();
		} catch(e) {
			
		}
	}
}

function save() {
	fs.writeFileSync("database.json", data);
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
