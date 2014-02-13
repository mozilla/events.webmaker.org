var Habitat = require('habitat');

Habitat.load();

// Configuration
var env = new Habitat();

// App
var app = require('./config')(env);

// Run server
app.listen(env.get('PORT', 1989), function () {
  console.log('Now listening on %d', env.get('PORT'));
});
