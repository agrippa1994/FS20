var app = angular.module("app", ["ngRoute", "ngResource", "ApplicationControllers"]);

app.factory("FS20", ["$http", function($http){
	return {
		fetchHouses: function(callback) {
			$http.get("/house")
			.success(function(data) {
				callback(false, data);
			})
			.error(function() {
				callback(true, null);
			});
		},

		fetchDevices: function(house, callback) {
			$http.get("/house/" + house.id + "/device")
			.success(function(data) {
				callback(false, data);
			})
			.error(function() {
				callback(true, null);
			});
		},

		enable: function(device, callback) {
			$http.get("/house/" + device.house_id + "/device/" + device.id + "/enable")
			.success(function(data) {
				callback(false, data);
			})
			.error(function() {
				callback(true, null);
			});
		},

		disable: function(device, callback) {
			$http.get("/house/" + device.house_id + "/device/" + device.id + "/disable")
			.success(function(data) {
				callback(false, data);
			})
			.error(function() {
				callback(true, null);
			});
		}
	};
}]);

app.factory("SidebarDelegate", [function() {
	return {
		// @overridable
		sidebarElementClicked: function(house) { }
	};
}]);

app.factory("HouseViewModel", [function() {
	return {
		changeHouse: function(house) {
			this.houseChanged(house);
		},

		// @overridable
		houseChanged: function(house) { }
	};
}]);

app.directive("sidebar", function(){
	return {
		templateUrl: "parts/sidebar.html",
		replace: true,
		restrict: "E"
	};
});

app.directive("houseview", function() {
	return {
		templateUrl: "parts/houseview.html",
		replace: true,
		restrict: "E"
	};
});