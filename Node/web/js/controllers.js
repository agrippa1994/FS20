angular.module("controllers", [])

.controller("MenubarController", function($rootScope, $scope, $window, FS20) {
    $rootScope.title = "FS20";
    
    $scope.rooms = FS20.rooms.query();
    $scope.roomClicked = function(room) {
        $scope.$emit("MenubarControllerRoomChanged", room);
    };
    
    $scope.brandingClicked = function() {
        $window.location.reload();
    };
})

.controller("RoomViewController", function($rootScope, $scope, $route, $location, FS20, Notification) {
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
    
    $scope.onAdd = function() {
        $location.path("/room/" + $route.current.params.roomID + "/add");
    };
})

.controller("RoomAddController", function($scope, $route, $location, FS20, Notification) {
    $scope.name = "";
    $scope.code = "";
    
    $scope.onCancel = function() {
        $location.path("/room/" + $route.current.params.roomID);
    };

    $scope.$watch("code", function() {
        if(!FS20.isValidFS20Code($scope.code))
            $("#code").addClass("error").removeClass("success");
        else
            $("#code").addClass("success").removeClass("error");   
    });
    
    $scope.$watch("name", function() {
        if($scope.name.length > 0)
            $("#name").addClass("success").removeClass("error");  
        else
            $("#name").addClass("error").removeClass("success");  
    });
    
    $scope.onSubmit = function(name, code) {
        var success = true;
        if(!FS20.isValidFS20Code(code)) {
            Notification("Fehler", "Der FS20 Code ist ungültig!", "alert");
            success = false;
        }
        
        if(name.length <= 0) {
            Notification("Fehler", "Es wurde kein Name angegeben!", "alert");   
            success = false;
        }
        
        if(success) {
            FS20.devices($route.current.params.roomID).save({name: $scope.name, device_code: parseInt($scope.code)});
        }
    };
})

.controller("MainController", function($scope, $rootScope, $route, $location, Notification) {
    $rootScope.$on("MenubarControllerRoomChanged", function(event, room) {
        $location.path("/room/" + room.id);
    });
})
