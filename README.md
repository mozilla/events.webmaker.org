[![Build Status](https://travis-ci.org/mozilla/webmaker-events-2.svg?branch=master)](https://travis-ci.org/mozilla/webmaker-events-2)
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

### Configuration

To pass configuration to the server, `cp .env-dist .env` or create a `.env` file in the root directory.

This app takes four configuration parameters, all of which are optional.

`PORT` - Where to run the server

`EVENTS_LOCATION` - The URL of the events service

`ACCOUNT_SETTINGS_URL` - The the URL for account settings pages on Webmaker Login, e.g. http://localhost:3000/account

`MY_MAKES_URL` = The URL for the my makes page on Webmaker e.g. http://localhost:7777/me

`GA_ACCOUNT` = The Google Analytics property e.g. UA-XXXXX-X

`GA_DOMAIN` = The domain for the your Google Analytics property


## Grunt Tasks

- **grunt** - Runs a server at [localhost:1981](http://localhost:1981).
- **grunt clean** - Runs JSHint and beautifies JS to comply with our [contribution guidelines](https://github.com/mozilla/webmaker-events-2/blob/master/CONTRIBUTING.md).
- **grunt heroku** - For heroku

### Localization

Some of the code was taken from [Angularjs LocalizationServer](https://github.com/lavinjj/angularjs-localizationservice/) by Jim Lavin.

All strings are included and can be found in [locale/<en_US>/translation.json](/locale/en_US/events2.json).

The format is slightly different than how we do it in Webmaker apps and this is the format:

``` json
"_string_name_": {
  "message": "Some value here",
  "description": "Description here can be useful for Transifex since translator can see this."
},
"_create_account_": {
  "message": "Create Account",
  "description": "Create and account button"
},
"_back_to_webmaker_": {
  "message": "Back to Webmaker",
  "description": "Button to go back to Webmaker.org site"
}
```

To localize string in template file you have three options:

1. `{{ '_some_key_name_' | i18n }}`
  This will check the translation file and look for that specific key name and return the message. If key name not found it will return **unkown key: "_some_key_name_"**.

2. `<span ng-bind-html="'_some_key_name' | i18n"></span>`

  This method is useful when you have some markup.

3. `<span bind-unsafe-html"'_some_key_name' | i18n"></span>`

  This method is useful when you have some variable inside your string for instance: "My name is {{name}}."

