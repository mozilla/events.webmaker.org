// Services -------------------------------------------------------------------

angular.module('myApp.services', ['ngResource'])
  .run(['$http', '$rootScope',
    function ($http, $rootScope) {
      $http
        .get('/config.json')
        .success(function (data) {
          $rootScope._config = data;
        });
    }
  ])
  .factory('vendor.moment', function () {
    // TODO: More strongly enforced/real dependency system
    return window.moment;
  })
  .factory('authInterceptor', function ($rootScope, $q, $window) {
    return {
      request: function (config) {
        config.headers = config.headers || {};
        if ($rootScope._user) {
          config.headers.Authorization = 'Bearer ' + $rootScope._user.token;
        }
        return config;
      },
      response: function (response) {
        if (response.status === 401) {
          response.data = 'There was a problem with the authentication token -- maybe you are not signed in?';
        }
        return response || $q.when(response);
      }
    };
  })
  .factory('eventService', ['$rootScope', '$resource',
    function ($rootScope, $resource) {
      return $resource($rootScope._config.eventsLocation + '/events/:id', null, {
        update: {
          method: 'PUT'
        }
      });
    }
  ])
  .factory('personaService', ['$http', '$q', '$rootScope', '$location', '$window',
    function personaService($http, $q, $rootScope, $location, $window) {

      // Restore user state from local storage.
      $rootScope._user = $window.localStorage._user ? angular.fromJson($window.localStorage._user) : {};

      // Update local storage on changes to _user object.
      $rootScope.$watch('_user', function() {
        if ($rootScope._user) {
          $window.localStorage._user = angular.toJson($rootScope._user);
        } else {
          delete $window.localStorage._user;
        }
      });

      // Set up login/logout functions
      $rootScope.login = function () {
        navigator.id.request();
      };
      $rootScope.logout = function () {
        navigator.id.logout();
      };

      navigator.id.watch({
        loggedInUser: null,
        onlogin: function (assertion) {
          var deferred = $q.defer();
          var audience = window.location.origin;

          $http
            .post($rootScope._config.eventsLocation + '/auth', {
              audience: audience,
              assertion: assertion
            })
            .then(function (response) {
              if (response.status !== 200) {
                deferred.reject(response.data);
              } else {
                deferred.resolve(response.data);
              }
            });

          deferred.promise.then(function (data) {
            $rootScope._user = data;

          }, function (err) {
            navigator.id.logout();
            console.log(err);
          });
        },
        onlogout: function () {
          delete $rootScope._user;
          $rootScope.$apply();
        }
      });

      return {};
    }
  ]);
