// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('addEventController', ['$scope', '$location', 'moment', 'chrono', 'eventService',
    function ($scope, $location, moment, chrono, eventService) {
      $scope.event = {};
      $scope.event.parsedNaturalStartDate = undefined;
      $scope.attemptedToSubmit = false;
      $scope.isLoggedIn = false;

      // Set default values for form
      $scope.event.attendees = 0; // Unknown amount
      $scope.event.duration = 1; // 1 hour default

      // Keep email and login status up to date
      $scope.$watch('_persona.email', function (newValue) {
        $scope.isLoggedIn = !! newValue;
        $scope.event.organizer = $scope._persona.email;
      });

      // Continuously translate natural language date to JS Date
      $scope.$watch('event.beginDate', function (newValue) {
        if (newValue) {
          $scope.event.parsedNaturalStartDate = chrono.parseDate(newValue);
        }
      });

      $scope.addEvent = function () {
        $scope.attemptedToSubmit = true;

        // Create a serialized event object to avoid modifying $scope
        // Stringify & parse to create a true copy instead of a reference
        var serializedEvent = JSON.parse(JSON.stringify($scope.event));

        serializedEvent.beginDate = $scope.event.parsedNaturalStartDate.toISOString();

        if ($scope.event.duration !== 'unknown') {
          serializedEvent.endDate = moment($scope.event.parsedNaturalStartDate).add('hours', parseFloat($scope.event.duration, 10)).toISOString();
        } else {
          // Don't send an end date if duration is not specific
          delete serializedEvent.endDate;
        }

        // Remove nonexistant DB values from client event object
        delete serializedEvent.duration;
        delete serializedEvent.parsedNaturalStartDate;

        console.log(serializedEvent);

        eventService.save(serializedEvent, function (data) {
          // Switch to detail view on successful creation
          $location.path('/events/' + data.id);
        }, function (err) {
          // TODO : Show error to user
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
  .controller('eventDetailController', ['$scope', '$http', '$routeParams', 'eventService', 'moment',
    function ($scope, $http, $routeParams, eventService, moment) {
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
