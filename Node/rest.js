var epilogue = require("epilogue"),
	database = require("./database.js");
	
module.exports = function(baseUrl, app) {
	epilogue.initialize({
		app: app,
		sequelize: database.sequelize,
		base: baseUrl
	});
	
	epilogue.resource({
		model: database.room,
		associations: true
	});
	
	epilogue.resource({
		model: database.device,
		associations: true
	});
	
	epilogue.resource({
		model: database.timer,
		associations: true
	});
	
	epilogue.resource({
		model: database.timeout,
		associations: true
	});
}
