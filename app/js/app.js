angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'ui.bootstrap',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.when('/add', {
      templateUrl: 'views/add.html',
      controller: 'addEventController'
    });
    $routeProvider.when('/events', {
      templateUrl: 'views/list.html',
      controller: 'eventListController'
    });
    $routeProvider.when('/events/:id', {
      templateUrl: 'views/detail.html',
      controller: 'eventDetailController'
    });
    $routeProvider.when('/edit/:id', {
      templateUrl: 'views/edit.html',
      controller: 'eventEditController'
    });
    $routeProvider.otherwise({
      redirectTo: '/events'
    });
  }
])
.config(function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
})
.
run(['$rootScope',
  function ($rootScope) {
    $rootScope.$on('$locationChangeSuccess', function (event) {
      window.scrollTo(0, 0);
    });
  }
])
