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
      controller: ['$scope', '$element',
        function ($scope, $element) {
          $element.on('click', function (event) {
            $scope.isCollapsed = !$scope.isCollapsed;
          });
        }
      ]
    };
  });
