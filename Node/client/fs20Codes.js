module.exports = {
	isValid: function(code) {
		var c = parseInt(code);
		if(isNaN(c))
			return false;

		if(c < 1111 || c > 4444)
			return false;

		for(var i = 1; i <= 4; i++, c = Math.floor(c / 10))
			if(c % 10 < 1 || c % 10 > 4)
				return false;

		return true;
	}
};