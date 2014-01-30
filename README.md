[![Code Climate](https://codeclimate.com/github/gvn/webmaker-events.png)](https://codeclimate.com/github/gvn/webmaker-events)

# Webmaker Events

## Build Dependencies

- npm
- grunt CLI `npm install -g grunt-cli`
- bower `npm install -g bower`

## Setup

### Application Setup

```bash
git clone https://github.com/gvn/webmaker-events.git
cd webmaker-events && npm install
```

### Service Setup

Profile uses a REST service for its backend.

To run the service locally:

1. Clone [webmaker-events-service](https://github.com/k88hudson/webmaker-events-service) into a new location (most likely parallel to **webmaker-profile**)
2. `cd` into the `webmaker-events-service` directory
3. Run `node server.js`

## Grunt Tasks

- **grunt** - Runs a server at [localhost:1134](http://localhost:1134).
- **grunt clean** - Runs JSHint and beautifies JS to comply with our [contribution guidelines](https://github.com/gvn/webmaker-events/blob/master/CONTRIBUTING.md).
