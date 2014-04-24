// Directives -----------------------------------------------------------------

angular.module('myApp.directives', [])
  .directive('appVersion', ['version',
    function (version) {
      return function (scope, elm, attrs) {
        elm.text(version);
      };
    }
  ])
  .directive('ngClick', function () {
    // Prevent default on all elements that have ngClick defined
    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        if (attrs.href === '#') {
          el.on('click', function (e) {
            e.preventDefault();
          });
        }
      }
    };
  })
  .directive('autocompleteLocation', function () {
    return {
      restrict: 'A',
      controller: ['$element', '$scope', 'loadGoogleMaps',
        function ($element, $scope, loadGoogleMaps) {

          loadGoogleMaps.ready(function () {
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

              $scope.$emit('locationAutocompleted', {
                latitude: placeData.geometry.location.lat(),
                longitude: placeData.geometry.location.lng(),
                city: city,
                country: country
              });

              // Force view model to update after autocompletion
              // TODO: This is kind of gross too. What's the "angular way"?
              $element.trigger('input');
            });
          });

        }
      ]
    };
  })
  .directive('weReadonly', function () {
    return {
      restrict: 'A',
      link: function ($scope, $element, attrs) {
        $scope.$watch(attrs.weReadonly, function (value) {
          if (value) {
            $element.attr('readonly', true);
          } else {
            $element.removeAttr('readonly');
          }
        });
      }
    };
  })
  .directive('weListing', function () {
    return {
      restrict: 'E',
      link: function ($scope, $element) {
        $scope.geoLocationEnabled = false;
        $scope.sortName = 'date';

        var myLatitude, myLongitude;

        navigator.geolocation.getCurrentPosition(function (position) {
          myLatitude = position.coords.latitude;
          myLongitude = position.coords.longitude;

          $scope.geoLocationEnabled = true;
          $scope.$apply();
        });

        function distance(x1, y1, x2, y2) {
          return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
        }

        $scope.orderByProximity = function (event) {
          if (event.latitude && event.longitude) {
            return distance(myLatitude, myLongitude, event.latitude, event.longitude);
          } else {
            // If no lat/long are available, assume event is very far away
            return 999999999;
          }
        };

        $scope.orderByDate = function (event) {
          var date = new Date(event.beginDate);
          return date.valueOf();
        };
      }
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
