angular.module("controllers", [])

.controller("MenubarController", function($scope, $window, FS20) {
    $scope.rooms = FS20.rooms.query();
    $scope.roomClicked = function(room) {
        $scope.$emit("MenubarControllerRoomChanged", room);
    };
    
    $scope.brandingClicked = function() {
        $window.location.reload();
    };
})

.controller("RoomController", function($scope, $route, FS20, Notification) {
    $scope.devices = FS20.devices($route.current.params.roomID).query();
    
    $scope.onAction = function(device, state, $event){
        var stateText = state ? "eingeschaltet" : "ausgeschaltet";
        $($event.target).addClass("loading-pulse lighten");
        
        FS20.setState(device, state).$promise.then(function() {
            Notification("Erfolg", device.name + " wurde " + stateText);
            $($event.target).removeClass("loading-pulse lighten");
        }, function() {
            Notification("Fehler", device.name + " konnte nicht " + stateText + " werden!", "alert");
            $($event.target).removeClass("loading-pulse lighten");
        });
    };
})

.controller("MainController", function($scope, $rootScope, $route, $location, Notification) {
    $rootScope.$on("MenubarControllerRoomChanged", function(event, room) {
        $location.path("/room/" + room.id);
    });
})
