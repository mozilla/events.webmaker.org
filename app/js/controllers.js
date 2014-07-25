// Controllers ----------------------------------------------------------------

angular.module('myApp.controllers', [])
  .controller('homeController', ['$scope', '$timeout', 'eventService',
    function ($scope, $timeout, eventService) {
      eventService({
        'Range': '0-9'
      }).query({
        after: (new Date()).toISOString(),
        dedupe: true
      }, function (data) {
        $scope.events = data;
      });
    }
  ])
  .controller('TimepickerCtrl', ['$scope', '$timeout', 'moment',
    function ($scope, $timeout, moment) {
      $scope.event.beginTime = moment().hour(12).minutes(0);
    }
  ])
  .controller('DatepickerCtrl', ['$scope', '$timeout',
    function ($scope, $timeout) {
      $scope.today = function () {
        $scope.event.beginDate = new Date();
      };
      $scope.today();

      $scope.clear = function () {
        $scope.event.beginDate = null;
      };

      $scope.open = function () {
        $timeout(function () {
          $scope.opened = true;
        });
      };

      $scope.dateOptions = {
        'year-format': '\'yy\'',
        'starting-day': 1,
        'show-weeks': false
      };
    }
  ])
  .controller('userController', ['$scope', '$rootScope', '$routeParams', 'eventService',
    function ($scope, $rootScope, $routeParams, eventService) {
      $scope.username = $routeParams.id;

      $scope.isCoorganizer = function (event) {
        return event.coorganizers.some(function (c) {
          return c.userId === $rootScope._user.id;
        });
      };

      $scope.isMentor = function (event) {
        return event.mentors.some(function (m) {
          return m.userId === $rootScope._user.id;
        });
      };

      $scope.isOrganizer = function (event) {
        return event.organizerId === $rootScope._user.username;
      };

      eventService().query({
        organizerId: $scope.username
        // TODO: Put this back in once service is fixed
        // userId: $rootScope._user.id
      }, function (data) {
        $scope.events = data;
      });
    }
  ])
  .controller('checkInController', ['$scope', '$rootScope', '$routeParams', 'eventService', 'attendeeService', 'attendeeListService', 'analytics',
    function ($scope, $rootScope, $routeParams, eventService, attendeeService, attendeeListService, analytics) {
      // Get event data
      eventService().get({
        id: $routeParams.id
      }, function (data) {
        $scope.eventData = data;
      }, function (err) {
        console.error(err);

        if (err.status === 404) {
          document.location.hash = '#!/errors/404';
        }
      });

      function getAttendees() {
        attendeeListService.get({
          eventid: $routeParams.id
        }, function success(attendees) {
          var rsvpdOrUnregistered = [];

          attendees.forEach(function (attendee) {
            if (attendee.didRSVP || attendee.email) {
              rsvpdOrUnregistered.push(attendee);
            }
          });

          $scope.attendees = rsvpdOrUnregistered.reverse();
        }, function fail(error) {
          console.error(error);
        });
      }

      getAttendees();

      /**
       * Set checkin status to either true or false
       * @param {object} With `userID` and/or `email` properties
       * @param {boolean} status
       */
      $scope.setCheckinStatus = function (attendee, status) {
        var options = {
          eventid: $routeParams.id,
          checkin: status
        };

        if (attendee.email) {
          options.email = attendee.email;
        } else if (attendee.userID) {
          options.userid = attendee.userID;
        } else {
          console.error('Missing email or userid.');
        }

        attendeeService.save(options, function success() {
          getAttendees();

          if (status) {
            analytics.event('Event creator changed check in status of attendee', {
              label: 'Yes'
            });
          } else {
            analytics.event('Event creator changed check in status of attendee', {
              label: 'No'
            });
          }
        }, function fail(error) {
          console.error(error);
          analytics.event('Check in of attendee failed');
        });
      };

      $scope.addParticipant = function (email) {
        if ($scope.addParticipantForm.participantEmail.$invalid) {
          $scope.triedToAddInvalidEmail = true;
          return;
        } else {
          $scope.triedToAddInvalidEmail = false;
        }

        attendeeService.save({
          email: email,
          eventid: $routeParams.id,
          checkin: true,
          rsvp: false
        }, function success() {
          $scope.unregisteredEmail = '';
          getAttendees();
          analytics.event('Event creator checked in unregistered attendee');
        }, function fail(error) {
          console.error(error);
          analytics.event('Check in of unregistered attendee failed');
        });
      };
    }
  ])
  .controller('addUpdateController', ['$scope', '$location', '$rootScope', '$routeParams', 'moment', 'eventService', 'eventFormatter', 'usernameService', 'analytics', 'attendeeListService', 'dateIsToday',
    function ($scope, $location, $rootScope, $routeParams, moment, eventService, eventFormatter, usernameService, analytics, attendeeListService, dateIsToday) {

      $scope.event = {};
      $scope.eventID = $routeParams.id;
      $scope.eventIsToday = false;

      // Update or add?
      if ($routeParams.id) {
        $scope.isUpdate = true;
      } else {
        $scope.isAdd = true;
      }

      if ($scope.isUpdate) {
        eventService().get({
          id: $routeParams.id
        }, function (data) {
          // Update all the values in the form with values from DB:
          $scope.event.title = data.title;
          $scope.event.description = data.description;
          $scope.event.estimatedAttendees = data.estimatedAttendees || 5;
          $scope.event.organizer = data.organizer;
          $scope.event.organizerId = data.organizerId;
          $scope.event.ageGroup = data.ageGroup || '';
          $scope.event.skillLevel = data.skillLevel || '';
          $scope.event.tags = data.tags;
          $scope.event.mentorRequests = data.mentorRequests || [];
          $scope.event.mentors = data.mentors || [];
          $scope.event.coorganizers = data.coorganizers || [];
          $scope.event.areAttendeesPublic = data.areAttendeesPublic || false;
          $scope.event.isEmailPublic = data.isEmailPublic || false;
          $scope.event.makeApiTag = data.makeApiTag;
          $scope.event.flickrTag = data.flickrTag;

          // TEMP : Need to convert back from city/country/lat/long/whatever
          $scope.event.address = data.address;

          if (data.registerLink) {
            $scope.event.registerLink = data.registerLink;
          }

          var momentBeginDate = moment(data.beginDate);
          var hour = momentBeginDate.get('hour');
          var minutes = momentBeginDate.get('minutes');
          $scope.event.beginDate = momentBeginDate.hour(hour).minutes(minutes).format();
          $scope.event.beginTime = $scope.event.beginDate;
          $scope.event.duration = 'unknown'; // default to unknown

          // Parse out duration from end date if it exists
          if (data.endDate) {
            var endDate = moment(data.endDate);
            var duration = endDate.diff(data.beginDate, 'minutes') / 60;

            if (duration < 3 && duration > 0) {
              $scope.event.duration = duration;
            }
          }

          // Determine if today is the event day:
          $scope.eventIsToday = dateIsToday(data.beginDate);

          // Attendee list
          attendeeListService.get({
            eventid: $routeParams.id
          }, function (data) {
            $scope.attendees = data;
          });

        }, function (err) {
          console.error(err);
        });
      } else {
        // Add event

        $scope.event.organizer = $rootScope._user.email;
        $scope.event.organizerId = $rootScope._user.username;

        $scope.event.coorganizers = [];
        $scope.event.mentorRequests = [];
        $scope.event.mentors = [];

        // Set default values for form
        $scope.event.estimatedAttendees = 5; // Under 10 by default
        $scope.event.duration = 1; // 1 hour default

        // $scope.attemptedToSubmit = false;
      }

      $scope.addUser = function (input, type) {
        var user = {};
        if (type === 'coorganizer') {
          input = input.toLowerCase();
          usernameService.post({
            username: input
          }, function (data) {
            if (data.exists) {
              if (data.username !== $rootScope._user.username) {
                user.username = input;
                $scope.event.coorganizers.push(user);
                $scope.coorganizerInput = '';
                $scope.addEventForm.coorganizer_email_input.$error.invalidUsername = false;
              } else {
                $scope.addEventForm.coorganizer_email_input.$error.cantAddSelf = true;
              }
            } else {
              $scope.addEventForm.coorganizer_email_input.$error.invalidUsername = true;
            }
          });
        } else {
          user.email = input;
          $scope.event.mentorRequests.push(user);
          $scope.mentorInput = '';
        }
      };

      $scope.removeUser = function (user, type) {
        var index = $scope.event[type + 's'].indexOf(user);
        if (index > -1) {
          $scope.event[type + 's'].splice(index, 1);
        }
      };

      // Keep email and login status up to date
      $scope.$watch('_user.email', function () {
        $scope.event.organizer = $scope._user.email;
      });

      $scope.$watch('_user.username', function () {
        $scope.event.organizerId = $scope._user.username;
      });

      $scope.$watch('event.beginDate', function (newValue, oldValue) {
        if (oldValue < newValue || oldValue > newValue) {
          $scope.event.beginDate = new Date(newValue);
        }
      });

      $scope.beginTimeObj = {};
      $scope.$watch('event.beginTime', function (newValue, oldValue) {
        if ($scope.addEventForm.beginTime.$invalid) {
          return;
        }
        if (oldValue < newValue || oldValue > newValue) {
          var newMoment = moment(newValue);
          $scope.beginTimeObj.hour = newMoment.get('hour');
          $scope.beginTimeObj.minutes = newMoment.get('minutes');
          $scope.event.beginDate = moment($scope.event.beginDate)
            .set('hour', $scope.beginTimeObj.hour)
            .set('minutes', $scope.beginTimeObj.minutes).format();
        }
      });

      $scope.$on('locationAutocompleted', function (event, data) {
        $scope.event.latitude = data.latitude;
        $scope.event.longitude = data.longitude;
        $scope.event.city = data.city;
        $scope.event.country = data.country;
      });

      $scope.addEvent = function () {
        $scope.eventSaveInProgress = true;
        $scope.attemptedToSubmit = true;

        var eventData = eventFormatter($scope.addEventForm, $scope.event);

        // Only admins can change the primary organizer on behalf of other people
        if (!$rootScope._user.isAdmin) {
          $scope.event.organizer = $rootScope._user.email;
          $scope.event.organizerId = $rootScope._user.username;
        }

        if (eventData) {
          eventService().save(eventData, function (data) {
            $scope.eventSaveInProgress = false;

            $rootScope.justCreatedAnEvent = true;

            // Switch to detail view on successful creation
            $location.path('/events/' + data.id);

            analytics.event('Add Event');
          }, function (err) {
            $scope.eventSaveInProgress = false;
            // TODO : Show error to user
            console.error('addEvent save error: ' + err.data);
          });
        } else {
          $scope.eventSaveInProgress = false;
          console.warn('Form is invalid.');
        }
      };

      $scope.saveChanges = function () {
        $scope.eventSaveInProgress = true;
        $scope.attemptedToSubmit = true;

        var eventData = eventFormatter($scope.addEventForm, $scope.event);

        if (eventData) {
          eventService().update({
            id: $routeParams.id
          }, eventData, function (data) {
            $scope.eventSaveInProgress = false;
            $location.path('/events/' + $routeParams.id);
          }, function (err) {
            $scope.eventSaveInProgress = false;
            console.error(err);
          });
        } else {
          $scope.eventSaveInProgress = false;
        }

      };

      $scope.deleteEvent = function () {
        if (window.confirm('Are you sure you want to delete your event?')) {
          eventService().delete({
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
  .controller('eventListController', ['$scope',
    function ($scope) {}
  ])
  .controller('eventDetailController', ['$scope', '$rootScope', '$http', '$routeParams', '$sanitize', 'eventService', 'moment', 'config', 'dateIsToday',
    function ($scope, $rootScope, $http, $routeParams, $sanitize, eventService, moment, config, dateIsToday) {
      eventService().get({
        id: $routeParams.id
      }, function (data) {
        if ($rootScope.justCreatedAnEvent === true) {
          $scope.freshEvent = true;
          $rootScope.justCreatedAnEvent = false;
        }

        $scope.eventURL = window.location.href;
        $scope.isEventOver = moment().diff(moment(data.beginDate)) > 0;

        $scope.webmakerUrl = config.webmakerUrl;
        $scope.eventIsToday = dateIsToday(data.beginDate);

        data.description = $sanitize(data.description);

        $scope.eventData = data;
        $scope.eventData.friendlyStartDate = moment(data.beginDate).format('dddd, MMMM Do, h:mma');
        $scope.eventID = $routeParams.id;

        //Gallery
        $scope.galleryTags = data.makeApiTag && data.makeApiTag.split(',');
        $scope.flickrTags = data.flickrTag && data.flickrTag.split(',').join('+');
        if (data.flickrTag) {
          $http({
            method: 'GET',
            url: config.eventsLocation + '/events/' + data.id + '/flickr?limit=9',
            withCredentials: true
          }).success(function (photos) {
            $scope.photos = photos;
          });
        }

        // Split up mentors into 4 so we can do proper rows
        $scope.eventData.mentorsIn4 = [];
        $scope.eventData.mentors.forEach(function (mentor, i) {
          if (i % 4 === 0) {
            $scope.eventData.mentorsIn4.push([]);
          }
          var index = Math.floor(i / 4);
          $scope.eventData.mentorsIn4[index].push(mentor);
        });

        // TODO: Eventually competency IDs will be added during event creation.
        // Right now random IDs are created as a hook for varying detail view header colors.
        $scope.eventData.competencyID = Math.floor(Math.random() * 16);

        $scope.isCoorganizer = function () {
          return $scope.eventData.coorganizers.some(function (c) {
            return c.userId === $rootScope._user.id;
          });
        };

        $scope.$on('rsvpChange', function (event, data) {
          $scope.$broadcast('rsvpChanged', data);
        });

        $scope.$on('privateChange', function (event, data) {
          $scope.$broadcast('privateChanged', data);
        });

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
          authService.analytics.webmakerNewUserCancelled();
          $modalInstance.dismiss('cancel');
        };
      };

      authService.verify();
    }
  ])
  .controller('confirmController', ['$scope', '$routeParams', '$http', 'eventService', 'tokenService', 'config', 'analytics',
    function ($scope, $routeParams, $http, eventService, tokenService, config, analytics) {
      var token = $routeParams.token;
      var eventId = $routeParams.eventId;
      var confirmNo = $routeParams.confirmation === 'no';

      $scope.event = {};
      $scope.isValid = false;
      $scope.confirmNo = confirmNo;
      $scope.eventUrl = window.location.origin + '/#!/events/' + eventId;

      $scope.sendConfirmation = function (confirmation) {
        if (confirmation) {
          analytics.event('Event Mentor Confirmed by Email');
        } else {
          analytics.event('Event Mentor Declined by Email');
        }
        $http({
          method: 'POST',
          url: config.eventsLocation + '/confirm/mentor/' + token,
          data: {
            confirmation: confirmation
          },
          withCredentials: true
        })
          .success(function (mentor) {
            $scope.isConfirmSuccessfull = 'confirm-' + confirmation;
          })
          .error(function (err) {
            console.log(err);
          });
      };

      $scope.reset = function () {
        delete $scope.isConfirmSuccessfull;
      };

      // verify token
      tokenService.verifyToken({
        token: token,
        eventId: eventId
      }, function (resp) {
        if (!resp.valid) {
          return;
        }

        $scope.isValid = true;

        // Get event
        eventService().get({
          id: eventId
        }, function (event) {
          $scope.event = event;
        }, function (err) {
          console.log(err);
        });
      }, function (err) {
        console.log(err);
      });
    }
  ])
  .controller('tagListController', ['$scope', '$routeParams', 'eventService',
    function ($scope, $routeParams, eventService) {
      $scope.tagName = $routeParams.id;

      eventService().query({
        after: (new Date()).toISOString(),
        tag: $routeParams.id
      }, function (data) {
        $scope.events = data;
      });
    }
  ]);
