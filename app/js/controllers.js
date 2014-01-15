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
      console.log(eventService);
      eventService.query(function(data) {
        $scope.events = data;
      });
    }
  ])
  .controller('eventDetailController', ['$scope', '$http', '$routeParams',
    function($scope, $http, $routeParams) {
      eventService.get({
        id: $routeParams.id,
      }, function(data) {
        $scope.events = data;
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
