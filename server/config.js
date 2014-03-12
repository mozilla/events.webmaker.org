module.exports = function (env) {
  var express = require('express');
  var app = express();
  var csp = require('./csp');

  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());

  // CSP
  app.use(csp({
    reportToHost: env.get('CSP_LOGGER'),
    eventsLocation: env.get('eventsLocation') || 'http://localhost:1989'
  }));

  // Static files
  app.use(express.static('./app'));

  // Health check
  var healthcheck = {
    version: require('../package').version,
    http: 'okay'
  };

  app.get('/healthcheck', function (req, res) {
    res.json(healthcheck);
  });

  // Serve up virtual configuration "file"
  var config = {
    version: require('../package').version,
    eventsLocation: env.get('eventsLocation') || 'http://localhost:1989',
    accountSettingsUrl: env.get('accountSettingsUrl') || 'https://login.webmaker.org/account',
    myMakesUrl: env.get('myMakesUrl') || 'https://webmaker.org/me'
  };

  app.get('/config.js', function (req, res) {
    res.setHeader('Content-type', 'text/javascript');
    res.send('window.eventsConfig = ' + JSON.stringify(config));
  });

  return app;
};
