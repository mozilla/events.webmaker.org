module.exports = function (env) {
  var express = require('express');
  var app = express();

  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.json());
  app.use(express.urlencoded());

  // Static files
  app.use(express.static('./app'));

  // Serve up virtual configuration "file"
  app.get('/config.js', function (req, res) {
    var config = {
      eventsLocation: env.get('eventsLocation')
    };

    res.setHeader('Content-type', 'text/javascript');
    res.send('window.eventsConfig = ' + JSON.stringify(config));
  });

  return app;
};
