// Filters --------------------------------------------------------------------

angular.module('myApp.filters', [])
  .filter('uriEncode',
    function () {
      return function (text) {
        return encodeURIComponent(text);
      };
    })
  .filter('interpolate', ['version',
    function (version) {
      return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
      };
    }
  ]);
