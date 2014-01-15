// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('addEventController', ['$scope', 'eventService',
    function($scope, eventService) {
      $scope.attendees = 5;
      $scope.attemptedToSubmit = false;

      $scope.addEvent = function() {
        $scope.attemptedToSubmit = true;
        eventService.save($scope.event, function(data) {
          console.log(data);
        }, function(err) {
          console.log(err.data);
        });
      }
    }
  ])
  .controller('eventListController', ['$scope', 'eventService',
    function($scope, eventService) {
      eventService.query(function(data) {
        $scope.events = data;
      });
    }
  ])
  .controller('eventDetailController', ['$scope', '$http', '$routeParams', 'eventService',
    function($scope, $http, $routeParams, eventService) {
      eventService.get({
        id: $routeParams.id,
      }, function(data) {
        $scope.eventData = data;
      }, function(err) {
        console.log(err);
      });
    }
  ])
  .controller('navController', ['$scope', '$location',
    function($scope, $location) {
      $scope.isActive = function(location) {
        return location === $location.path();
      }
    }
  ]);
