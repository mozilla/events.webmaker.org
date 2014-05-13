// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('homeController', ['$scope', '$timeout', 'eventService',
    function ($scope, $timeout, eventService) {
      eventService.query({
        after: (new Date()).toISOString()
      }, function (data) {
        $scope.events = data.splice(0, 4);
      });
    }
  ])
  .controller('userController', ['$scope', '$routeParams', 'eventService',
    function ($scope, $routeParams, eventService) {
      $scope.username = $routeParams.id;

      eventService.query({
        organizerId: $scope.username
      }, function (data) {
        $scope.events = data;
      });
    }
  ])
  .controller('addEventController', ['$scope', '$location', '$rootScope', 'moment', 'chrono', 'eventService', 'eventFormatter',
    function ($scope, $location, $rootScope, moment, chrono, eventService, eventFormatter) {
      $scope.event = {};
      $scope.event.parsedNaturalStartDate = undefined;
      $scope.attemptedToSubmit = false;

      // Set default values for form
      $scope.event.attendees = 5; // Under 10 by default
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

        // Add user info
        $scope.event.organizer = $rootScope._user.email;
        $scope.event.organizerId = $rootScope._user.username;

        var eventData = eventFormatter($scope.addEventForm, $scope.event);

        if (eventData) {
          eventService.save(eventData, function (data) {
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
  .controller('eventEditController', ['$scope', '$routeParams', '$location', 'eventService', 'chrono', 'moment', 'eventFormatter',
    function ($scope, $routeParams, $location, eventService, chrono, moment, eventFormatter) {
      eventService.get({
        id: $routeParams.id
      }, function (data) {

        // Update all the values in the form with values from DB:

        $scope.event = {};
        $scope.event.title = data.title;
        $scope.event.description = data.description;
        $scope.event.attendees = data.attendees || 5;
        $scope.event.organizer = data.organizer;
        $scope.event.organizerId = data.organizerId;
        $scope.event.ageGroup = data.ageGroup || '';
        $scope.event.skillLevel = data.skillLevel || '';
        $scope.event.tags = data.tags;

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

      $scope.saveChanges = function () {

        $scope.attemptedToSubmit = true;

        var eventData = eventFormatter($scope.addEventForm, $scope.event);

        if (eventData) {
          eventService.update({
            id: $routeParams.id
          }, eventData, function (data) {
            $location.path('/events/' + $routeParams.id);
          }, function (err) {
            console.error(err.data);
          });
        }

      };

      $scope.deleteEvent = function () {
        if (window.confirm('Are you sure you want to delete your event?')) {
          eventService.delete({
            id: $routeParams.id
          }, $scope.event, function () {
            $location.path('/events');
          }, function (err) {
            console.error(err.data);
          });
        }
      };
    }
  ])
  .controller('eventListController', ['$scope', 'eventService',
    function ($scope, eventService) {
      eventService.query({
        after: (new Date()).toISOString(),
        limit: 30
      }, function (data) {
        $scope.events = data;
      });
    }
  ])
  .controller('eventDetailController', ['$scope', '$http', '$routeParams', '$sanitize', 'eventService', 'moment',
    function ($scope, $http, $routeParams, $sanitize, eventService, moment) {
      eventService.get({
        id: $routeParams.id,
      }, function (data) {

        data.description = $sanitize(data.description);

        $scope.eventData = data;
        $scope.eventData.friendlyStartDate = moment(data.beginDate).format('dddd, MMMM Do, h:mma');
        $scope.eventID = $routeParams.id;

        // TODO: Eventually competency IDs will be added during event creation.
        // Right now random IDs are created as a hook for varying detail view header colors.
        $scope.eventData.competencyID = Math.floor(Math.random() * 16);

      }, function (err) {
        console.error(err);

        if (err.status === 404) {
          document.location.hash = '#!/errors/404';
        }
      });
    }
  ])
  .controller('navController', ['$scope', '$location', 'config',
    function ($scope, $location, config) {

      $scope.isActive = function (location) {
        return location === $location.path();
      };

      $scope.webmakerUrl = config.webmakerUrl;
      $scope.accountSettingsUrl = config.accountSettingsUrl;
      $scope.myMakesUrl = config.myMakesUrl;

    }
  ])
  .controller('errorController', ['$scope', '$routeParams',
    function ($scope, $routeParams) {
      $scope.errorCode = $routeParams.code;
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

      var createUserCtrl = function ($scope, $modalInstance, authService, assertion, config) {

        $scope.form = {};
        $scope.user = {};
        $scope.supported_languages = config.supported_languages;
        $scope.currentLang = config.lang;
        $scope.langmap = config.langmap;

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
