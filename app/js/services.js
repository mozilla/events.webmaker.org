// Services -------------------------------------------------------------------

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource'])
  .factory('eventService', ['$resource',
    function($resource) {
      return $resource('http://localhost:1989/events/:id', null, {
        update: {
          method: 'PUT'
        }
      });
    }
  ]);
