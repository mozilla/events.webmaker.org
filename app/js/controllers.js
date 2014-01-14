// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', []).
  controller('addEventController', ['$scope', function($scope) {
    $scope.attendees = 5;

    $scope.addEvent = function () {
      console.log($scope);
    }
  }])
  .controller('eventDetailController', [function() {

  }]);


