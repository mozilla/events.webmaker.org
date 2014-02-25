// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('addEventController', ['$scope', '$location', 'moment', 'chrono', 'eventService',
    function ($scope, $location, moment, chrono, eventService) {
      $scope.event = {};
      $scope.event.parsedNaturalStartDate = undefined;
      $scope.attemptedToSubmit = false;

      // Set default values for form
      $scope.event.attendees = 0; // Unknown amount
      $scope.event.duration = 1; // 1 hour default

      // Keep email and login status up to date
      $scope.$watch('_user.email', function () {
        $scope.event.organizer = $scope._user.email;
      });

      // Continuously translate natural language date to JS Date
      $scope.$watch('event.beginDate', function (newValue) {
        if (newValue) {
          $scope.event.parsedNaturalStartDate = chrono.parseDate(newValue);
          $scope.event.isValidStartDate = moment($scope.event.parsedNaturalStartDate).isValid();
          $scope.event.humanParsedDate = moment($scope.event.parsedNaturalStartDate).format('MMMM Do YYYY [at] h:mma');
        }
      });

      $scope.$on('locationAutocompleted', function (event, data) {
        $scope.event.latitude = data.latitude;
        $scope.event.longitude = data.longitude;
        $scope.event.city = data.city;
        $scope.event.country = data.country;
      });

      $scope.addEvent = function () {
        $scope.attemptedToSubmit = true;

        if ($scope.addEventForm.$invalid) {
          // prevent form from being sent if there are invalid fields
          return window.scrollTo(0, 0);
        }

        // Create a serialized event object to avoid modifying $scope
        var serializedEvent = {};
        angular.copy($scope.event, serializedEvent);

        if ($scope.event.beginDate) {
          serializedEvent.beginDate = $scope.event.parsedNaturalStartDate.toISOString();
        }

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

        if ($scope.addEventForm.$valid) {
          eventService.save(serializedEvent, function (data) {
            // Switch to detail view on successful creation
            $location.path('/events/' + data.id);
          }, function (err) {
            // TODO : Show error to user
            console.error('addEvent save error: ' + err.data);
          });
        } else {
          console.warn('Form is invalid.');
        }
      };
    }
  ])
  .controller('eventEditController', ['$scope', '$routeParams', '$location', 'eventService', 'moment',
    function ($scope, $routeParams, $location, eventService, moment) {
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

        $scope.event.beginDate = moment(data.beginDate).format('MMMM Do YYYY [at] h:mma');
        $scope.event.duration = 'unknown'; // default to unknown

        // Parse out duration from end date if it exists
        if (data.endDate) {
          var endDate = moment(data.endDate);
          var duration = endDate.diff(data.beginDate, 'minutes') / 60;

          if (duration < 3 && duration > 0) {
            $scope.event.duration = duration;
          }
        }
      }, function (err) {
        console.error(err);
      });

      $scope.$on('locationAutocompleted', function (event, data) {
        $scope.event.latitude = data.latitude;
        $scope.event.longitude = data.longitude;
        $scope.event.city = data.city;
        $scope.event.country = data.country;
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
          console.error(err.data);
        });
      };

      $scope.deleteEvent = function () {
        if (window.confirm('Are you sure you want to delete your event?')) {
          eventService.delete({
            id: $routeParams.id
          }, $scope.event, function () {
            console.log('deleted');
          }, function (err) {
            console.error(err.data);
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
        console.error(err);
      });
    }
  ])
  .controller('navController', ['$scope', '$location',
    function ($scope, $location) {

      $scope.isActive = function (location) {
        return location === $location.path();
      };
    }
  ])
  .controller('createUserController', ['$scope', '$http', '$modal', 'authService',
    function ($scope, $http, $modal, authService) {

      authService.on('newuser', function (assertion) {
        $modal.open({
          templateUrl: 'views/partials/create-user-form.html',
          controller: createUserCtrl,
          resolve: {
            assertion: function () {
              return assertion;
            }
          }
        });
      });

      var createUserCtrl = function ($scope, $modalInstance, authService, assertion) {

        $scope.form = {};
        $scope.user = {};

        $scope.checkUsername = function () {
          if (!$scope.form.user.username) {
            return;
          }
          $http
            .post(authService.urls.checkUsername, {
              username: $scope.form.user.username.$viewValue
            })
            .success(function (username) {
              $scope.form.user.username.$setValidity('taken', !username.exists);
            })
            .error(function (err) {
              console.log(err);
              $scope.form.user.username.$setValidity('taken', true);
            });
        };

        $scope.createUser = function () {
          $scope.submit = true;
          if ($scope.form.user.$valid && $scope.form.agree) {
            authService.createUser({
              assertion: assertion,
              user: $scope.user
            });
            $modalInstance.close();
          }
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
      };

      authService.verify();
    }
  ]);
