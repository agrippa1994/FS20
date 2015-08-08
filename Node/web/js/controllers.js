var applicationControllers = angular.module("ApplicationControllers", []);

applicationControllers.controller("MainController", function($scope, SidebarDelegate, HouseViewModel) {
	SidebarDelegate.sidebarElementClicked = function(house) {
		HouseViewModel.changeHouse(house);
	}
});

applicationControllers.controller("SidebarController", function($scope, FS20, SidebarDelegate){
	$scope.houses = [];
	$scope.selectedIndex = -1;

	$scope.selected = function(house) {
		$scope.selectedIndex = $scope.houses.indexOf(house);
		SidebarDelegate.sidebarElementClicked(house);
	};

	FS20.fetchHouses(function(err, data){
		if(data != null)
			$scope.houses = data;
	});
});

applicationControllers.controller("HouseViewController", function($scope, FS20, HouseViewModel) {
	$scope.devices = [];
	$scope.currentHouse = null;

	$scope.enable = function(device) {
		FS20.enable(device, function(error, data) {
			if(data.exitCode != 0)
				alert("Error: " + data.exitText);
		});
	}

	$scope.disable = function(device) {
		FS20.disable(device, function(error, data) {
			if(data.exitCode != 0)
				alert("Error: " + data.exitText);
		});
	}

	HouseViewModel.houseChanged = function(house) {
		$scope.currentHouse = house;

		FS20.fetchDevices(house, function(err, data){
			if(data != null)
				$scope.devices = data;
		});
	}
});