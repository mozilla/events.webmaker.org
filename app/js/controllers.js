// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', []).
  controller('addEventController', ['$scope', function($scope) {
    $scope.attendees = 5;
    $scope.attemptedToSubmit = false;

    $scope.addEvent = function () {
      $scope.attemptedToSubmit = true;

      console.log($scope.event);
    }
  }])
  .controller('eventListController', ['$scope', '$http', function($scope, $http) {
    $http.get('http://localhost:1989/events')
      .success(function(data) {
        console.log(data);
        $scope.events = data;
      })
      .error(function(err) {
        console.log(err);
      })
  }])
  .controller('eventDetailController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    $http.get('http://localhost:1989/events/' + $routeParams.id)
      .success(function(data) {
        $scope.eventData = data;
      })
      .error(function(err) {
        console.log(err);
      });
  }])
  .controller('navController', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function (location) {
      return location === $location.path();
    }
  }]);
