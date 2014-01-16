// Services -------------------------------------------------------------------

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource'])
  .run(['$http', '$rootScope', function($http, $rootScope) {
    $http
      .get('/config.json')
      .success(function(data) {
        $rootScope._config = data;
      });
  }])
  .factory('eventService', ['$rootScope', '$resource',
    function($rootScope, $resource) {
      return $resource($rootScope._config.eventsLocation + '/events/:id', null, {
        update: {
          method: 'PUT'
        }
      });
    }
  ]);
