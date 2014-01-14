// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', []).
  controller('addEventController', ['$scope', function($scope) {
    $scope.attendees = 5;
    $scope.attemptedToSubmit = false;

    $scope.addEvent = function () {
      $scope.attemptedToSubmit = true;

      var event = {
        title: $scope.title,
        description: $scope.description,
        attendees: $scope.attendees,
        beginDate: $scope.beginDate,
        beginTime: $scope.beginTime,
        endDate: $scope.endDate,
        endTime: $scope.endTime,
        registerLink: $scope.registerLink
        // latitude: ,
        // longitude: ,
        // city: ,
        // country: ,
        // picture: ,
        // organizer: ,
        // organizerId ,
        // featured
      }

      console.log(event);
    }
  }])
  .controller('eventDetailController', [function() {

  }])
  .controller('navController', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function (location) {
      return location === $location.path();
    }
  }]);
