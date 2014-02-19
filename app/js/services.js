// Services -------------------------------------------------------------------

angular.module('myApp.services', ['ngResource'])
  .constant('config', window.eventsConfig)
  .constant('moment', window.moment)
  .constant('chrono', window.chrono)
  .constant('showdown', window.Showdown)
  .factory('eventService', ['$rootScope', '$resource', 'config',
    function ($rootScope, $resource, config) {
      return $resource(config.eventsLocation + '/events/:id', null, {
        update: {
          method: 'PUT'
        }
      });
    }
  ])
  .factory('authService', ['$rootScope', 'config',
    function authService($rootScope, config) {

      // This is needed to apply scope changes for events that happen in
      // async callbacks.
      function apply() {
        $rootScope.$$phase || $rootScope.$apply();
      }

      var auth = new WebmakerAuthClient({
        host: config.eventsLocation,
        handleNewUserUI: false
      });

      // Set up login/logout functions
      $rootScope.login = auth.login;
      $rootScope.logout = auth.logout;

      // Set up user data
      $rootScope._user = {};

      auth.on('login', function(user) {
        $rootScope._user = user;
        apply();

      });

      auth.on('verify', function(user) {
        $rootScope._user = user;
        apply();
      });

      auth.on('logout', function(why) {
       $rootScope._user = {};
      });

      auth.on('error', function(message, xhr) {
        console.log('error', message, xhr);
      });

      return auth;
    }
  ]);
