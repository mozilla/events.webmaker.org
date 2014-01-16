// Services -------------------------------------------------------------------

// Demonstrate how to register services
// In this case it is a simple value service.
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
  .factory('eventService', ['$rootScope', '$resource',
    function($rootScope, $resource) {
      return $resource($rootScope._config.eventsLocation + '/events/:id', null, {
        update: {
          method: 'PUT'
        }
      });
    }
  ])
  .factory('personaService', ['$http', '$q', '$rootScope',
    function personaService($http, $q, $rootScope) {

      navigator.id.watch({
        loggedInUser: null,
        onlogin: function(assertion) {
          var deferred = $q.defer();

          $http.post('/persona/verify', {
            assertion: assertion
          })
            .then(function(response) {
              if (response.data.status != 'okay') {
                deferred.reject(response.data.reason);
              } else {
                deferred.resolve(response.data.email);
              }
            });

          deferred.promise.then(function(email) {
            $rootScope._user = email;
          });
        },
        onlogout: function() {
          $http.post('/persona/logout')
            .then(function(response) {
              if (response.data.status === 'okay') {
                $rootScope._user = '';
              }
            });
        }
      });

      return {};
    }
  ]);
