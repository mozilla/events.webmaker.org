// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('addEventController', ['$scope', 'eventService',
    function ($scope, eventService) {
      $scope.attendees = 5;
      $scope.attemptedToSubmit = false;

      $scope.addEvent = function () {
        console.log('add event');
        $scope.attemptedToSubmit = true;
        eventService.save($scope.event, function (data) {
          console.log(data);
        }, function (err) {
          console.log(err.data);
        });
      };
    }
  ])
  .controller('eventEditController', ['$scope', '$routeParams', '$location', 'eventService',
    function ($scope, $routeParams, $location, eventService) {
      eventService.get({
        id: $routeParams.id
      }, function (data) {

        // Update all the values in the form with values from DB:

        $scope.event = {};
        $scope.event.title = data.title;
        $scope.event.description = data.description;
        $scope.event.attendees = data.attendees;

        // TEMP : Need to convert back from city/country/lat/long/whatever
        $scope.event.location = data.address + ', ' + data.city + ', ' + data.country;

        if (data.registerLink) {
          $scope.event.registerLink = data.registerLink;
        }

        function zeroPrefix(number) {
          if (number < 10) {
            return '0' + number;
          } else {
            return number;
          }
        }

        var beginDate = new Date(data.beginDate);

        $scope.event.beginDate = beginDate.getFullYear() + '-' + (zeroPrefix(beginDate.getMonth() + 1)) + '-' + zeroPrefix(beginDate.getDate());
        $scope.event.beginTime = beginDate.getHours() + ':' + beginDate.getMinutes();

        if (data.endDate) {
          var endDate = new Date(data.endDate);

          $scope.event.endDate = endDate.getFullYear() + '-' + (zeroPrefix(endDate.getMonth() + 1)) + '-' + zeroPrefix(endDate.getDate());
          $scope.event.endTime = endDate.getHours() + ':' + endDate.getMinutes();
        }
      }, function (err) {
        console.error(err);
      });

      $scope.saveChanges = function () {
        console.log('saveChanges');

        $scope.attemptedToSubmit = true;

        eventService.update({
          id: $routeParams.id
        }, $scope.event, function (data) {
          console.log('saved ', data);
          $location.path('/events/' + $routeParams.id);
        }, function (err) {
          console.log(err.data);
        });
      };

      $scope.deleteEvent = function () {
        if (window.confirm('Are you sure you want to delete your event?')) {
          eventService.delete({
            id: $routeParams.id
          }, $scope.event, function () {
            console.log('deleted');
          }, function (err) {
            console.log(err.data);
          });
        }
      };
    }
  ])
  .controller('eventListController', ['$scope', 'eventService',
    function ($scope, eventService) {
      eventService.query(function (data) {
        $scope.events = data;
      });
    }
  ])
  .controller('eventDetailController', ['$scope', '$http', '$routeParams', 'eventService',
    function ($scope, $http, $routeParams, eventService) {
      eventService.get({
        id: $routeParams.id,
      }, function (data) {
        $scope.eventData = data;
        $scope.eventID = $routeParams.id;
      }, function (err) {
        console.log(err);
      });
    }
  ])
  .controller('navController', ['$scope', '$location',
    function ($scope, $location) {
      $scope.isActive = function (location) {
        return location === $location.path();
      };
    }
  ]);
