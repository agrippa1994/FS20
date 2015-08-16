angular.module("directives", [])

.directive("menubar", function() {
    return {
        templateUrl: "html/menubar.html",
        replace: true,
        restrict: "E"
    };
})
