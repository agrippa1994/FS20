angular.module("route", [])

.config(function($routeProvider) {
    $routeProvider
        .when("/room/:roomID", { 
            templateUrl: "html/roomview.html",
            controller: "RoomController" 
        }
    );
})

.run(function($rootScope, $location, Notification) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        
    });
})
