angular.module("app", ["ngResource", "ngRoute", "services", "controllers", "directives", "route"])

.run(function($rootScope) {
    $rootScope.title = "untitled";
})
