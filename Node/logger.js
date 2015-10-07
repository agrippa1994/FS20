var winston = require("winston");

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ 
			timestamp:true,
			colorize: true
		}),
		new (winston.transports.File)({ 
			timestamp: true, 
			filename: "log.txt" 
		})
	]
});

module.exports = logger;