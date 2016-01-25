angular.module("controllers", [])

.controller("MenubarController", function($rootScope, $scope, $location, $window, FS20, Notification) {
    $rootScope.title = "FS20";
    
    // Load rooms for the menu bar
    function loadRooms() {
        $scope.rooms = FS20.rooms.query();   
    }
    
    loadRooms();
    
    // The user has selected a room
    $scope.roomClicked = function(room) {
        $location.path("/room/" + room.id);
    };
    
    // The room is going to be deleted
    $scope.roomDeleteClicked = function(room) {
        FS20.room(room.id).delete().$promise.then(function() {
            Notification("Info", "Der Raum " + room.name + " wurde gelöscht", "info");
            loadRooms();
        }, function() {
               Notification("Fehler", "Der Raum konnte nicht gelöscht werden", "alert");
        });
    };
    
    // Is called whenever the branding is clicked
    $scope.brandingClicked = function() {
        $window.location.reload();
    };
})

.controller("RoomViewController", function($rootScope, $scope, $route, $location, FS20, Notification) {
    // Load the devices
    var roomID = $route.current.params.roomID;
    function loadDevices() {
        var room = FS20.room(roomID).get(function() {
            $scope.devices = room.devices;
        });
    }
    
    loadDevices();
    
    // Handle enable and disable commands for FS20
    $scope.onAction = function(device, state, $event){
        var stateText = state ? "eingeschaltet" : "ausgeschaltet";
        $($event.target).addClass("mif-spinner2 mif-ani-spin");
        $($event.target).html("");
        
        FS20.setState(roomID, device.id, state).$promise.then(function() {
            Notification("Erfolg", device.name + " wurde " + stateText);
            $($event.target).removeClass("mif-spinner2 mif-ani-spin");
            
            if(state)
                $($event.target).html("|");
            else
                $($event.target).html("O");
            
        }, function() {
            Notification("Fehler", device.name + " konnte nicht " + stateText + " werden!", "alert");
            $($event.target).removeClass("mif-spinner2 mif-ani-spin");
            
            if(state)
                $($event.target).html("|");
            else
                $($event.target).html("O");
        });
    };
    
    // The user wants to delete the device
    $scope.onDeleteDevice = function(device, $event) {
        FS20.device(device.id).delete().$promise.then(function() {
            Notification("Info", "Gerät " + device.name + " wurde gelöscht", "info");
            loadDevices();
        }, function(response) {
               Notification("Fehler", "Gerät " + device.name + " konnte nicht gelöscht werden", "alert");
        });
    };
    
    // The user wants to edit the device
    $scope.onEdit = function(device, $event) {
        $location.path("/room/" + $route.current.params.roomID + "/device/" + device.id + "/edit");
    };
    
    // Will be called whenever the user wants to add a new device to the current room
    $scope.onAdd = function() {
        $location.path("/room/" + $route.current.params.roomID + "/device/add");
    };
})

.controller("DeviceAddController", function($scope, $route, $location, FS20, Notification) {
    $scope.id = -1;
    $scope.name = "";
    $scope.code = "";

    var roomID = $route.current.params.roomID;
    var deviceID = $route.current.params.deviceID;
    
    // Whenever a device id is set, a device is edited by the user
    if(typeof $route.current.params.deviceID !== "undefined") {
        var device = FS20.device($route.current.params.deviceID).get(function() {
            $scope.id = $route.current.params.deviceID;
            $scope.name = device.name;
            $scope.code = device.code;
        });
        
    }
    
    // Cancel current operation
    $scope.onCancel = function() {
        $location.path("/room/" + $route.current.params.roomID);
    };

    // Watch for changes on the code input
    $scope.$watch("code", function() {
        if(!FS20.isValidFS20Code($scope.code))
            $("#code").addClass("error").removeClass("success");
        else
            $("#code").addClass("success").removeClass("error");   
    });
    
    // Watch for changes on the name input
    $scope.$watch("name", function() {
        if($scope.name.length > 0)
            $("#name").addClass("success").removeClass("error");  
        else
            $("#name").addClass("error").removeClass("success");  
    });
    
    // Callback for submit button
    $scope.onSubmit = function(name, code) {
        var success = true;
        
        // Check code validity
        if(!FS20.isValidFS20Code(code)) {
            Notification("Fehler", "Der FS20 Code ist ungültig!", "alert");
            success = false;
        }
        
        // Check the name
        if(name.length <= 0) {
            Notification("Fehler", "Es wurde kein Name angegeben!", "alert");   
            success = false;
        }
        
        if(success) {
            // Insert a new device if the given id is -1 otherwise edit the device
            if($scope.id === -1) {
                    FS20.devices().save({ name: $scope.name, code: parseInt($scope.code), roomId: roomID }).$promise.then(function(data){
                    Notification("Information", "Gerät " + $scope.name + " wurde hinzugefügt", "info");
                    $location.path("/room/" + roomID);
                }, function() {
                    Notification("Fehler", "Beim Hinzufügen ist ein Fehler aufgetreten", "alert");
                }); 
            } else {
                FS20.device(deviceID).update({ name: $scope.name, code: parseInt($scope.code) }).$promise.then(function(data) {
                    Notification("Information", "Gerät " + $scope.name + " wurde geändert", "info");
                    $location.path("/room/" + $route.current.params.roomID);
                }, function(response) {
                    Notification("Fehler", "Beim Speichern ist ein Fehler aufgetreten!", "alert");
                });
            }
        }
    };
})

.controller("MainController", function($scope) {
})
