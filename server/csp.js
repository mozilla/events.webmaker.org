var hood = require('hood');

module.exports = function(options) {
  var policy = {
    headers: [
      'Content-Security-Policy'
    ],
    policy: {
      'connect-src': ["'self'", options.eventsLocation, "http://*.log.optimizely.com", "https://*.log.optimizely.com"],
      'default-src': ["'self'"],
      'frame-src': ["'self'"],
      'img-src': ["*"],
      'script-src': ["'self'", "'unsafe-eval'", "https://maps.googleapis.com", "https://maps.gstatic.com", "https://login.persona.org", "https://ssl.google-analytics.com", "https://cdn.optimizely.com"],
      'style-src': ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      'font-src': ["'self'", "https://themes.googleusercontent.com"]
    }
  };

  if (options.reportToHost) {
    policy.policy['report-uri'] = [options.reportToHost];
  }

  return hood.csp(policy);
};
