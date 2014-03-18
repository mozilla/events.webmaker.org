module.exports = function (env) {
  var express = require('express');
  var i18n = require('webmaker-i18n');
  var path = require('path');
  var app = express();
  var defaultLang = 'en-US';
  var csp = require('./csp');

  app.use(require('prerender-node'));
  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());


  // Setup locales with i18n
  app.use( i18n.middleware({
    supported_languages: env.get('SUPPORTED_LANGS') || [defaultLang],
    default_lang: defaultLang,
    mappings: require('webmaker-locale-mapping'),
    translation_directory: path.resolve(__dirname, '../locale')
  }));

  // CSP
  app.use(csp({
    reportToHost: env.get('CSP_LOGGER'),
    eventsLocation: env.get('eventsLocation') || 'http://localhost:1989'
  }));

  // Static files
  app.use(express.static(path.join(__dirname, '../app')));

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
    myMakesUrl: env.get('myMakesUrl') || 'https://webmaker.org/me',
    webmakerUrl: env.get('WEBMAKER_URL') || 'https://webmaker.org'
  };

  app.get('/config.js', function (req, res) {
    config.lang = req.localeInfo.lang;
    config.direction = req.localeInfo.direction;
    config.defaultLang = defaultLang;
    config.supported_languages = i18n.getSupportLanguages();
    res.setHeader('Content-type', 'text/javascript');
    res.send('window.eventsConfig = ' + JSON.stringify(config));
  });

 // Localized Strings
 app.get('/strings/:lang?', i18n.stringsRoute('en-US'));

  return app;
};
