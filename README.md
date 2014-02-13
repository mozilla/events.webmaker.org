[![Code Climate](https://codeclimate.com/github/mozilla/webmaker-events-2.png)](https://codeclimate.com/github/mozilla/webmaker-events-2)

# Webmaker Events 2

## Build Dependencies

- npm
- grunt CLI `npm install -g grunt-cli`
- bower `npm install -g bower`

## Setup

### Application Setup

```bash
git clone https://github.com/mozilla/webmaker-events-2.git
cd webmaker-events-2 && npm install
```

### Service Setup

Profile uses a REST service for its backend.

To run the service locally:

1. Clone [webmaker-events-service](https://github.com/mozilla/webmaker-events-service) into a new location (most likely parallel to **webmaker-profile**)
2. `cd` into the `webmaker-events-service` directory
3. Run `node server.js`

## Grunt Tasks

- **grunt** - Runs a server at [localhost:1134](http://localhost:1134).
- **grunt clean** - Runs JSHint and beautifies JS to comply with our [contribution guidelines](https://github.com/mozilla/webmaker-events-2/blob/master/CONTRIBUTING.md).
- **grunt heroku** - For heroku
