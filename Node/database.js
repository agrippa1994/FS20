var Sequelize = require("sequelize");
var logger = require("./logger.js");

var sequelize = new Sequelize(null, null, null, {
	dialect: "sqlite",
	storage: "database.sqlite",
	logging: function(msg) {
		logger.info("Sequelize is " + msg);		
	}
});

// Define models
var Device = sequelize.define("device", {
	name: { type: Sequelize.STRING, allowNull: false, validate: { notEmpty: true } },
	code: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 0x00, max: 0xFF} },
});

var Room = sequelize.define("room", {
	name: { type: Sequelize.STRING, unique: true, allowNull: false, validate: { notEmpty: true } },
	code1: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 0x00, max: 0xFF} },
	code2: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 0x00, max: 0xFF} },
});

var Timeout = sequelize.define("timeout", {
	when: { type: Sequelize.DATE, allowNull: false },
	operation: { type: Sequelize.BOOLEAN, allowNull: false }	
});

var Timer = sequelize.define("timer", {
	when: { type: Sequelize.DATE, allowNull: false },
	days: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 0x00, max: 0x7F } },
	operation: { type: Sequelize.BOOLEAN, allowNull: false }	
});

// Define relations between models
Room.hasMany(Device, {
	onDelete: "CASCADE"
});

Device.belongsTo(Room);


Device.hasOne(Timeout, {
	onDelete: "CASCADE"
});

Timeout.belongsTo(Device);


Device.hasMany(Timer, {
	onDelete: "CASCADE"
});

Timer.belongsTo(Device);

// Sync database
sequelize.sync();

// Export

module.exports = {
	sequelize: sequelize,
	device: Device,
	room: Room,
	timeout: Timeout,
	timer: Timer
};
