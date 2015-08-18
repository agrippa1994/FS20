angular.module("app", ["ngResource", "ngRoute", "services", "controllers", "directives", "route"])

// Sets the title in the HTML Header
.run(function($rootScope) {
    $rootScope.title = "untitled";
})
