module.exports = function (env) {
  var express = require('express');
  var app = express();

  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.cookieParser())
  app.use(express.session({
    secret: 'awesomepersonasauce'
  }));


  // Static
  app.use(express.static('./app'));

  // Configuration file
  app.get('/config.json', function (req, res) {
    res.json({
      eventsLocation: env.get('eventsLocation')
    });
  });

  // Authentication
  require('express-persona')(app, {
    audience: env.get('audience')
  });

  return app;
};
