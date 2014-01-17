var Habitat = require('habitat');

Habitat.load();

// Configuration
var env = new Habitat();

// Defaults
if(!env.get('port')) {
  env.set('port', 1134);
}

if(!env.get('audience')) {
  env.set('audience', 'http://localhost:' + env.get('port'));
}

if(!env.get('eventsLocation')) {
  env.set('eventsLocation', 'http://webmaker-events-service.herokuapp.com');
}

// App
var app = require('./config')(env);

// Run server
app.listen(env.get('PORT'), function () {
  console.log('Now listening on %d', env.get('PORT'));
});
