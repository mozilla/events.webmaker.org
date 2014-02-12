// Directives -----------------------------------------------------------------

angular.module('myApp.directives', [])
  .directive('appVersion', ['version',
    function (version) {
      return function (scope, elm, attrs) {
        elm.text(version);
      };
    }
  ])
  .directive('autocompleteLocation', function () {
    return {
      restrict: 'A',
      controller: ['$element', '$scope',
        function ($element, $scope) {
          var autocomplete = new google.maps.places.Autocomplete($element[0], {});

          autocomplete.addListener('place_changed', function () {
            var placeData = autocomplete.getPlace();

            var city;
            var country;

            placeData.address_components.forEach(function (component) {
              if (component.types[0] === 'locality') {
                city = component.long_name;
              } else if (component.types[0] === 'country') {
                country = component.long_name;
              }
            });

            // Directly attach address info to scope.
            // TODO: This is kind of gross because it's a 2-way dep.
            //       Look into firing event or some other non domain-specific method
            $scope.event.latitude = placeData.geometry.location.lat();
            $scope.event.longitude = placeData.geometry.location.lng();
            $scope.event.city = city;
            $scope.event.country = country;

            // Force view model to update after autocompletion
            // TODO: This is kind of gross too. What's the "angular way"?
            $element.trigger('input');
          });
        }
      ]
    };
  })
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
