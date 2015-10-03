angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'wmMakeApiAngular',
  'ngWebmakerLogin',
  'localization',
  'begriffs.paginate-anything',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'rad.spiiin'
]).
config(['$routeProvider', '$locationProvider',
  function ($routeProvider, $locationProvider) {
    // Prevent Angular from losing its mind
    if (window.location.href !== decodeURI(window.location.href)) {
      window.location.href = decodeURI(window.location.href);
    }

    $locationProvider.html5Mode(true).hashPrefix('!');

    $routeProvider.when('/:locale/add', {
      templateUrl: '/views/add-update.html',
      controller: 'addUpdateController'
    });

    $routeProvider.when('/:locale/events', {
      templateUrl: '/views/list.html',
      controller: 'eventListController'
    });

    $routeProvider.when('/:locale/events/tag/:id', {
      templateUrl: '/views/tag-list.html',
      controller: 'tagListController'
    });

    $routeProvider.when('/:locale/events/:id', {
      templateUrl: '/views/detail.html',
      controller: 'eventDetailController'
    });

    $routeProvider.when('/:locale/edit/:id', {
      templateUrl: '/views/add-update.html',
      controller: 'addUpdateController'
    });

    $routeProvider.when('/:locale/event-guides', {
      templateUrl: '/views/event-guides.html'
    });

    $routeProvider.when('/:locale/user/:id', {
      templateUrl: '/views/user.html',
      controller: 'userController'
    });

    $routeProvider.when('/:locale/confirm/:type/:token', {
      templateUrl: '/views/confirm.html',
      controller: 'confirmController'
    });

    $routeProvider.when('/:locale/error/:code', {
      templateUrl: '/views/error.html',
      controller: 'errorController'
    });

    $routeProvider.when('/:locale/check-in/:id', {
      templateUrl: '/views/check-in.html',
      controller: 'checkInController'
    });

    $routeProvider.when('/:locale', {
      templateUrl: '/views/home.html',
      controller: 'homeController'
    });

    $routeProvider.otherwise({
      redirectTo: '/:locale/error/404'
    });
  }
]).
run(['$http', '$rootScope', 'config', '$location',
  function ($http, $rootScope, config, $location) {
    function forceLocale() {
      // matches any of these:
      // `en`, `en-us`, `en-US` or `ady`
      var href = $location.path();
      var matchesLang;
      var matches = href.match(/([a-z]{2,3})([-]([a-zA-Z]{2}))?/);
      if (matches) {
        if (matches[1] && matches[2]) {
          matchesLang = matches[1].toLowerCase() + matches[2].toUpperCase();
        } else {
          matchesLang = matches[1].toLowerCase();
        }
      }
      if ((matches && matches[0]) && config.supported_languages.indexOf(matchesLang) === -1) {
        $location.path(config.lang + href);
      } else if ((matches && matches[0]) && config.supported_languages.indexOf(matchesLang) !== -1) {
        return;
      } else {
        $location.path(config.lang + href);
      }
    }
    // Jump to top of viewport when new views load
    $rootScope.$on('$locationChangeSuccess', function (event) {
      window.scrollTo(0, 0);
      forceLocale();
    });
    // Set up user data
    $rootScope._user = {};

    // Set locale information
    if (config.supported_languages.indexOf(config.lang) > 0) {
      $rootScope.lang = config.lang;
    } else {
      $rootScope.lang = config.defaultLang;
    }
    $rootScope.direction = config.direction;
    $rootScope.arrowDir = config.direction === 'rtl' ? 'left' : 'right';

    $rootScope.eventsLocation = config.eventsLocation;

    // Forward old non-hash-bang URLS to hash-bang equivalents
    // eg:
    //  #/events -> #!/events
    //  #events -> #!/events
    if (window.location.hash.match(/^#[\/a-zA-Z]/)) {
      window.location.hash = window.location.hash.replace('#', '#!');
    }
    forceLocale();
  }
]);
