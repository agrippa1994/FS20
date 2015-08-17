angular.module("route", [])

.config(function($routeProvider) {
    $routeProvider
        .when("/room/:roomID", { 
                templateUrl: "html/roomview.html",
                controller: "RoomViewController" 
            }
        )
    
        .when("/room/:roomID/add", {
                templateUrl: "html/roomadd.html",
                controller: "RoomAddController"
            }
        );
})

.run(function($rootScope, $location, Notification) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        
    });
})
