echo 'Compiling ----------------------------------------------------------------------'
grunt build

echo 'Starting web server ------------------------------------------------------------'
node server/server.js &
SERVER_PID=$!
sleep 5 # TODO - Potential race condition here:

echo 'Starting webdriver -------------------------------------------------------------'
webdriver-manager start &
WEBDRIVER_PID=$!
sleep 5 # TODO - Potential race condition here:

echo 'Running tests ------------------------------------------------------------------'
protractor test/conf.js

echo 'Shutting down ------------------------------------------------------------------'
kill $SERVER_PID
kill $WEBDRIVER_PID
kill $(ps | grep '[s]elenium' | awk '{print $1}') # Kill externally spawned process
