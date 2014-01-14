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
  .controller('eventDetailController', [function() {

  }])
  .controller('navController', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function (location) {
      return location === $location.path();
    }
  }]);
