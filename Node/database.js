/*
	Structure of the database
	
	[{
		name: "Test"
		code1: 1111,
		code2: 1111,
		devices: [{
			name: "Test",
			code: 1111,
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

function createRoom(name, code1, code2) {
	for(var i = 0; i < data.length; i++)
		if(data[i].name == name)
			throw "Room already exists";
		
	data.push({ name: name, code1: code1, code2: code2, devices: [] });
	save();
}
 
function checkRoom(index) {
	if(index >= data.length)
		throw "No room at this index";
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

function createDeviceAt(index, name, code) {
	checkRoom(index);
	
	for(var i = 0; i < data[index].devices.length; i++)
		if(data[index].devices.name == name)
			throw "Device already exists";
	
	data[index].devices.push({name: name, code: code, timeout: {}, timers: [] });
	save();
}

function checkDevice(roomIndex, deviceIndex) {
	checkRoom(roomIndex);
	
	if(deviceIndex >= data[roomIndex].devices.length)
		throw "Device doesn't exist";
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
	
	for(var i = 0; i < data[roomIndex].devices.length; i++)
		if(data[roomIndex].devices.name == name)
			throw "Device with this name already exists";
			
	data[roomIndex].device[deviceIndex].name = name || data[roomIndex].device[deviceIndex].name;
	data[roomIndex].device[deviceIndex].code = code || data[roomIndex].device[deviceIndex].code;
	save();
}

function deleteDeviceAt(roomIndex, deviceIndex) {
	checkDevice(roomIndex, deviceIndex);
	
	data[roomIndex].device.splice(deviceIndex, 1);
	save();
}

function setDeviceTimeoutAt(roomIndex, deviceIndex, timeoutIn, operation) {
	checkDevice(roomIndex, deviceIndex);
	
	data[roomIndex].device[deviceIndex].timeout = { time: timeoutIn, operation: operation };
	save();
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
	}
}

function save() {
	fs.writeFileSync("database.json", data);
}