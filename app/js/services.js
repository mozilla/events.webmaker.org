// Services -------------------------------------------------------------------

angular.module('myApp.services', ['ngResource'])
  .run(['$http', '$rootScope',
    function($http, $rootScope) {
      $http
        .get('/config.json')
        .success(function(data) {
          $rootScope._config = data;
        });
    }
  ])
  // TODO: More strongly enforced/real dependency system
  .factory('vendor.moment', function () {
    return window.moment;
  })
  .factory('authInterceptor', function($rootScope, $q, $window) {
    return {
      request: function(config) {
        config.headers = config.headers || {};
        if ($window.localStorage.token) {
          config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
        }
        return config;
      },
      response: function(response) {
        if (response.status === 401) {
          response.data = 'There was a problem with the authentication token -- maybe you are not signed in?';
        }
        return response || $q.when(response);
      }
    };
  })
  .factory('eventService', ['$rootScope', '$resource',
    function($rootScope, $resource) {
      return $resource($rootScope._config.eventsLocation + '/events/:id', null, {
        update: {
          method: 'PUT'
        }
      });
    }
  ])
  .factory('personaService', ['$http', '$q', '$rootScope', '$location', '$window',
    function personaService($http, $q, $rootScope, $location, $window) {

      // Set up '_persona' on root scope
      $rootScope._persona = {
        email: '',
        login: function() {
          navigator.id.request();
        },
        logout: function() {
          navigator.id.logout();
        }
      };

      navigator.id.watch({
        loggedInUser: null,
        onlogin: function(assertion) {
          var deferred = $q.defer();
          var audience = window.location.origin;

          $http
            .post($rootScope._config.eventsLocation + '/auth', {
              audience: audience,
              assertion: assertion
            })
            .then(function(response) {
              if (response.status !== 200) {
                deferred.reject(response.data);
              } else {
                deferred.resolve(response.data);
              }
            });

          deferred.promise.then(function(data) {
            $rootScope._persona.email = data.email;
            $rootScope._persona.admin = data.admin;
            $window.localStorage.token = data.token;

          }, function(err) {
            delete $window.localStorage.token;
            console.log(err);
          });
        },
        onlogout: function() {
          delete $rootScope._persona.admin;
          delete $rootScope._persona.email;
          delete $window.localStorage.token;
          $rootScope.$apply();
        }
      });

      return {};
    }
  ]);
