// Directives -----------------------------------------------------------------

angular.module('myApp.directives', [])
  .directive('appVersion', ['version',
    function (version) {
      return function (scope, elm, attrs) {
        elm.text(version);
      };
    }
  ])
  .directive('eventForm', function () {
    return {
      restrict: 'E',
      templateUrl: '/views/partials/event-form.html',
      transclude: true
    };
  });
