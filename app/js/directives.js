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
  })
  .directive('collapse', function () {
    // Extend the `collapse` directive to collapse
    return {
      restrict: 'A',
      controller: ['$rootScope', '$scope', '$element',
        function ($rootScope, $scope, $element) {
          // Set to closed on load
          $scope.isCollapsed = true;

          // Collapse on view change
          $rootScope.$on('$locationChangeSuccess', function (event) {
            $scope.isCollapsed = true;
          });
        }
      ]
    };
  });
