angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/add', {templateUrl: 'partials/add.html', controller: 'addEventController'});
  $routeProvider.when('/event', {templateUrl: 'partials/list.html', controller: 'eventListController'});
  $routeProvider.when('/event/:id', {templateUrl: 'partials/detail.html', controller: 'eventDetailController'});
  $routeProvider.when('/edit/:id', {templateUrl: 'partials/add.html', controller: 'eventEditController'});
  $routeProvider.otherwise({redirectTo: '/event'});
}]);
