// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('addEventController', ['$scope', '$location', 'vendor.moment', 'eventService',
    function ($scope, $location, moment, eventService) {
      // Create ISO date from HTML5 date & time input formats
      function dateTimeToISO(date, time) {
        return (new Date(date + ' ' + time)).toISOString();
      }

      $scope.event = {};
      $scope.attemptedToSubmit = false;

      // Keep email and login status up to date
      $scope.$watch('_user.email', function () {
        $scope.event.organizer = $scope._user.email;
      });

      // Set default values for form
      $scope.event.attendees = 0;
      $scope.event.beginDate = moment().add('d', 1).format('YYYY-MM-DD'); // Default to today
      $scope.event.beginTime = '12:00'; // Noon default

      $scope.addEvent = function () {
        $scope.attemptedToSubmit = true;

        if ($scope.addEventForm.$invalid) {
          // prevent form from being sent if there are invalid fields
          return window.scrollTo(0, 0);
        }

        // Create a serialized event object to avoid modifying $scope
        // (ISO date will confuse the date picker)
        var serializedEvent = $scope.event;

        serializedEvent.beginDate = dateTimeToISO($scope.event.beginDate, $scope.event.beginTime);

        if ($scope.event.endDate && $scope.event.endTime) {
          serializedEvent.endDate = dateTimeToISO($scope.event.endDate, $scope.event.endTime);
        }

        // Remove DB deprecated values from client event object
        delete serializedEvent.beginTime;
        delete serializedEvent.endTime;

        eventService.save(serializedEvent, function (data) {
          $location.path('/events/' + data.id);
        }, function (err) {
          console.error('addEvent save error: ' + err.data);
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
        $scope.event.address = data.address;

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
        $scope.eventData.friendlyStartDate = moment(data.beginDate).format('dddd, MMMM Do, h:mma');
        $scope.eventID = $routeParams.id;
      }, function (err) {
        console.log(err);
      });
    }
  ])
  .controller('navController', ['$scope', '$location', 'personaService',
    function ($scope, $location, personaService) {

      $scope.isActive = function (location) {
        return location === $location.path();
      };
    }
  ]);
