// Services -------------------------------------------------------------------

angular.module('myApp.services', ['ngResource'])
  .constant('moment', window.moment)
  .constant('chrono', window.chrono)
  .constant('showdown', window.Showdown)
  .factory('eventService', ['$rootScope', '$resource',
    function ($rootScope, $resource) {
      return $resource('http://localhost:1981' + '/events/:id', null, {
        update: {
          method: 'PUT'
        }
      });
    }
  ])
  .factory('authService', ['$rootScope',
    function authService($rootScope) {

      // This is needed to apply scope changes for events that happen in
      // async callbacks.
      function apply() {
        $rootScope.$$phase || $rootScope.$apply();
      }

      var auth = new WebmakerAuthClient({
        host: 'http://localhost:1981',/*$rootScope.config.eventsLocation*/
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
