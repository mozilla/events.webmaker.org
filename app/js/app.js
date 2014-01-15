angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/add', {templateUrl: 'partials/add.html', controller: 'addEventController'});
  $routeProvider.when('/event', {templateUrl: 'partials/list.html', controller: 'eventListController'});
  $routeProvider.when('/event/:id', {templateUrl: 'partials/detail.html', controller: 'eventDetailController'});
  $routeProvider.otherwise({redirectTo: '/event'});
}]);
