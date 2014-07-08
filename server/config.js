module.exports = function (env) {
  var express = require('express');
  var i18n = require('webmaker-i18n');
  var path = require('path');
  var app = express();
  var defaultLang = 'en-US';
  var csp = require('./csp');
  var messina = require('messina')('webmaker-events-2-' + env.get('NODE_ENV'));
  var wts = require('webmaker-translation-stats');
  var WebmakerAuth = require('webmaker-auth');

  var auth = new WebmakerAuth({
    loginURL: env.get('LOGIN_URL'),
    authLoginURL: env.get('LOGIN_URL_WITH_AUTH'),
    secretKey: env.get('SESSION_SECRET'),
    forceSSL: env.get('FORCE_SSL'),
    domain: env.get('COOKIE_DOMAIN')
  });

  app.use(require('prerender-node'));
  if (env.get('ENABLE_GELF_LOGS')) {
    messina.init();
    app.use(messina.middleware());
  } else {
    app.use(express.logger('dev'));
  }
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(auth.cookieParser());
  app.use(auth.cookieSession());

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
    wts(i18n.getSupportLanguages(), path.join(__dirname, '../locale'), function(err, data) {
      if(err) {
        healthcheck.locales = err.toString();
      } else {
        healthcheck.locales = data;
      }
      res.json(healthcheck);
    });
  });

  // Login
  app.post('/verify', auth.handlers.verify);
  app.post('/authenticate', auth.handlers.authenticate);
  app.post('/create', auth.handlers.create);
  app.post('/logout', auth.handlers.logout);
  app.post('/check-username', auth.handlers.exists);

  // Serve up virtual configuration "file"
  var config = {
    version: require('../package').version,
    eventsLocation: env.get('eventsLocation') || 'http://localhost:1989',
    accountSettingsUrl: env.get('accountSettingsUrl') || 'https://login.webmaker.org/account',
    myMakesUrl: env.get('myMakesUrl') || 'https://webmaker.org/me',
    webmakerUrl: env.get('WEBMAKER_URL') || 'https://webmaker.org',
    ga_account: env.get('GA_ACCOUNT') || 'UA-XXXXX-X',
    ga_domain: env.get('GA_DOMAIN') || 'example.com'
  };

  app.get('/config.js', function (req, res) {
    config.lang = req.localeInfo.lang;
    config.direction = req.localeInfo.direction;
    config.defaultLang = defaultLang;
    config.langmap = i18n.getAllLocaleCodes();
    config.supported_languages = i18n.getSupportLanguages();
    res.setHeader('Content-type', 'text/javascript');
    res.send('window.eventsConfig = ' + JSON.stringify(config));
  });

 // Localized Strings
 app.get('/strings/:lang?', i18n.stringsRoute('en-US'));

  return app;
};
