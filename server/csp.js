var hood = require('hood');

module.exports = function(options) {
  var policy = {
    headers: [
      'Content-Security-Policy'
    ],
    policy: {
      'connect-src': ["'self'", options.eventsLocation, "https://makeapi.webmaker.org", "ws://localhost:35729"],
      'default-src': ["'self'"],
      'img-src': ["*"],
      'script-src': ["'self'", "'unsafe-eval'", "https://maps.googleapis.com", "https://maps.gstatic.com", "https://login.persona.org", "https://ssl.google-analytics.com", "http://localhost:35729"],
      'style-src': ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      'font-src': ["'self'", "https://themes.googleusercontent.com", "https://fonts.gstatic.com"],
      'frame-src': ["https://www.youtube.com"]
    }
  };

  if (options.reportToHost) {
    policy.policy['report-uri'] = [options.reportToHost];
  }

  return hood.csp(policy);
};
