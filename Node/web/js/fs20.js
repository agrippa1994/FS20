var fs20 = angular.module("fs20", ["ngResource"]);

fs20.factory("fs20", function($resource) {
    return {
        all: $resource("/api"),
        rooms: $resource("/api/house"),
        devices: function(roomID) {
            return $resource("/api/house/:roomID/device", { roomID: roomID });
        }
    };
});