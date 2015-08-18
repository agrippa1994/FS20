angular.module("route", [])

// Router for HTML5 hashbang URLs
.config(function($routeProvider) {
    $routeProvider
        .when("/room/:roomID", { 
                templateUrl: "html/roomview.html",
                controller: "RoomViewController" 
            }
        )
        .when("/room/:roomID/device/add", {
                templateUrl: "html/deviceadd.html",
                controller: "DeviceAddController"
            }
        )
        .when("/room/:roomID/device/:deviceID/edit", {
            templateUrl: "html/deviceadd.html",
            controller: "DeviceAddController"
            }
        )
        .otherwise("/");
})

.run(function($rootScope, $location, Notification) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        
    });
})
