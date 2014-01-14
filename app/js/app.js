angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/add', {templateUrl: 'partials/add.html', controller: 'add'});
  $routeProvider.when('/event', {templateUrl: 'partials/list.html', controller: 'eventList'});
  $routeProvider.otherwise({redirectTo: '/event'});
}]);
