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
  .directive('ngEnter', function () {
    return function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
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
  .directive('selectize', function (config) {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        var options = [];

        for (var i = 0; i <= config.supported_languages.length; i++) {
          var title = config.langmap[config.supported_languages[i]] ? config.langmap[config.supported_languages[i]].nativeName : 'unknown';
          options.push({
            id: config.supported_languages[i],
            title: title
          });
        }

        $element.selectize({
          options: options,
          labelField: 'title',
          valueField: 'id'
        });
        var selectize = $element[0].selectize;
        selectize.setValue(config.lang);
      }
    };
  })
  .directive('weListing', function (config) {
    return {
      restrict: 'E',
      link: function ($scope, $element) {
        $scope.geoLocationEnabled = false; // TODO : Re-enable Geolocation via server-side sorting
        $scope.sortName = 'date';
        $scope.serviceURL = config.eventsLocation + '/events?after=' + (new Date()).toISOString();

        $scope.searchEvents = function (term) {
          var url = config.eventsLocation + '/events?after=' + (new Date()).toISOString();

          if (term) {
            url += '&search=' + term;
            $scope.searchActive = true;
          } else {
            $scope.searchActive = false;
            $scope.searchPhrase = '';
          }

          $scope.serviceURL = url;
        };
      }
    };
  })
  .directive('usernameInput', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, el, attrs, ctrl) {
        var usernameRegex = /^[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\-]{1,20}$/;
        ctrl.$parsers.unshift(function (viewValue) {
          if (!viewValue || usernameRegex.test(viewValue)) {
            ctrl.$setValidity('username', true);
            return viewValue;
          } else {
            ctrl.$setValidity('username', false);
            return undefined;
          }
        });
      }
    };
  })
  .directive('weRsvp', function () {
    // Markup schema: <we-rsvp event-id="" user-id="" />

    return {
      restrict: 'E',
      templateUrl: '/views/partials/rsvp.html',
      transclude: true,
      scope: {
        eventId: '=',
        userId: '='
      },
      controller: ['$rootScope', '$scope', '$element', 'attendeeService', 'attendeeInfoService', 'analytics',
        function ($rootScope, $scope, $element, attendeeService, attendeeInfoService, analytics) {
          $scope.isRSVPd = false;
          $scope.errorHappened = false;
          $scope.analytics = analytics;

          $scope.$watch('userId', function (value) {
            if (value) {
              attendeeInfoService.get({
                userid: $scope.userId
              }, function (attendanceData) {
                var currentEventInfo;

                for (var i = 0, ii = attendanceData.length; i < ii; i++) {
                  if (attendanceData[i].eventID === $scope.eventId) {
                    currentEventInfo = attendanceData[i];
                    break;
                  }
                }

                if (currentEventInfo && typeof currentEventInfo.didRSVP === 'boolean') {
                  $scope.isRSVPd = currentEventInfo.didRSVP;
                  $scope.hasRSVPd = true;
                }
              }, function fail() {
                console.error('Failed to fetch attendance data for user ' + $scope.userId);
              });
            }
          });

          var messageTimer;

          $scope.login = $rootScope.login;

          $scope.rsvp = function (isAttending) {
            $scope.isRSVPd = isAttending;
            $scope.hasRSVPd = true;
            $scope.statusJustChanged = true;
            $scope.errorHappened = false;

            function rsvpFail() {
              analytics.event('RSVP change failed to persist.');
              $scope.errorHappened = true;
            }

            if (isAttending) {
              attendeeService.save({
                userid: $scope.userId,
                eventid: $scope.eventId,
                rsvp: true
              }, function () {
                $scope.$emit('rsvpChange');
              }, rsvpFail);
            } else {
              attendeeService.save({
                userid: $scope.userId,
                eventid: $scope.eventId,
                rsvp: false
              }, function () {
                $scope.$emit('rsvpChange');
              }, rsvpFail);
            }

            clearTimeout(messageTimer);

            messageTimer = setTimeout(function () {
              $scope.statusJustChanged = false;
              $scope.$apply();
            }, 2000);
          };

        }
      ]
    };
  })
  .directive('weRsvpList', function () {
    return {
      scope: {
        showHeader: '=',
        attendeesToShow: '='
      },
      controller: ['$scope', '$element', '$routeParams', 'attendeeListService', 'config',
        function ($scope, $element, $routeParams, attendeeListService, config) {
          $scope.webmakerUrl = config.webmakerUrl;

          function buildRSVPList() {
            attendeeListService.get({
              eventid: $routeParams.id
            }, function (data) {
              var rsvpdYes = [];

              // Filter out people who aren't coming
              data.forEach(function (attendee, index) {
                if (attendee.didRSVP) {
                  rsvpdYes.push(attendee);
                }
              });

              if (rsvpdYes.length > $scope.attendeesToShow) {
                $scope.overflowCount = rsvpdYes.length - $scope.attendeesToShow;
                rsvpdYes = rsvpdYes.slice(0, $scope.attendeesToShow);
              } else {
                $scope.overflowCount = 0;
              }

              $scope.rsvpList = rsvpdYes;
            });
          }

          buildRSVPList();

          // Update RSVP list when needed
          $scope.$on('rsvpChanged', function (event, data) {
            buildRSVPList();
          });
        }
      ],
      restrict: 'E',
      templateUrl: '/views/partials/rsvp-list.html',
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

// Override datepicker
angular.module("template/datepicker/datepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/datepicker.html",
    "<table>\n" +
    "  <thead>\n" +
    "    <tr>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\"><i class=\"fa fa-chevron-left\"></i></button></th>\n" +
    "      <th colspan=\"{{rows[0].length - 2 + showWeekNumbers}}\"><button type=\"button\" class=\"btn btn-default btn-sm btn-block\" ng-click=\"toggleMode()\"><strong>{{title}}</strong></button></th>\n" +
    "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\"><i class=\"fa fa-chevron-right\"></i></button></th>\n" +
    "    </tr>\n" +
    "    <tr ng-show=\"labels.length > 0\" class=\"h6\">\n" +
    "      <th ng-show=\"showWeekNumbers\" class=\"text-center\">#</th>\n" +
    "      <th ng-repeat=\"label in labels\" class=\"text-center\">{{label}}</th>\n" +
    "    </tr>\n" +
    "  </thead>\n" +
    "  <tbody>\n" +
    "    <tr ng-repeat=\"row in rows\">\n" +
    "      <td ng-show=\"showWeekNumbers\" class=\"text-center\"><em>{{ getWeekNumber(row) }}</em></td>\n" +
    "      <td ng-repeat=\"dt in row\" class=\"text-center\">\n" +
    "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\"><span ng-class=\"{'text-muted': dt.secondary}\">{{dt.label}}</span></button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);
angular.module("template/datepicker/popup.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/datepicker/popup.html",
    "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\">\n" +
    " <li ng-transclude></li>\n" +
    " <li ng-show=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
    "   <span class=\"btn-group\">\n" +
    "     <button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"today()\">{{currentText}}</button>\n" +
    "     <button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"clear()\">{{clearText}}</button>\n" +
    "   </span>\n" +
    "   <button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"isOpen = false\">{{closeText}}</button>\n" +
    " </li>\n" +
    "</ul>\n" +
    "");
}]);
angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/timepicker/timepicker.html",
    "<table>\n" +
    "  <tbody>\n" +
    "    <tr>\n" +
    "      <td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidHours}\">\n" +
    "        <input type=\"text\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-mousewheel=\"incrementHours()\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
    "      </td>\n" +
    "      <td>:</td>\n" +
    "      <td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
    "        <input type=\"text\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
    "      </td>\n" +
    "      <td ng-show=\"showMeridian\">\n" +
    "        <button type=\"button\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\">{{meridian}}</button>\n" +
    "      </td>\n" +
    "    </tr>\n" +
    "  </tbody>\n" +
    "</table>\n" +
    "");
}]);

