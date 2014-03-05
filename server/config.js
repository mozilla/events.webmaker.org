module.exports = function (env) {
  var express = require('express');
  var app = express();

  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());

  var config = {
    version: require('../package').version,
    eventsLocation: env.get('eventsLocation') || 'http://localhost:1989',
    accountSettingsUrl: env.get('accountSettingsUrl') || 'https://login.webmaker.org/account',
    myMakesUrl: env.get('myMakesUrl') || 'https://webmaker.org/me'
  };

  // Static files
  app.use(express.static('./app'));

  // Healthcheck
  app.get('/healthcheck', function (req, res) {
    res.send(config);
  });

  // Serve up virtual configuration "file"
  app.get('/config.js', function (req, res) {
    res.setHeader('Content-type', 'text/javascript');
    res.send('window.eventsConfig = ' + JSON.stringify(config));
  });

  return app;
};
