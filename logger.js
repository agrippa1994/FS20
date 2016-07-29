const winston = require("winston");
const path = require("path");

var logger = new winston.Logger({
	transports: [
		new winston.transports.Console({ 
			timestamp:true,
			colorize: true
		}),
		new winston.transports.File({ 
			timestamp: true, 
			filename: path.join(__dirname, "log.txt") 
		})
	]
});

module.exports = logger;
