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

1. Clone [webmaker-events-service](https://github.com/mozilla/webmaker-events-service) into a new location (most likely parallel to **webmaker-profile-2**)
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

- **grunt** - Run this for local development. It will spawn a server at [localhost:1981](http://localhost:1981), compile `index.template`, and recompile your LESS files as they are modified. It will also enable live reload.
- **grunt validate** - Checks to see if JS is beautified and passes JSHint. Checks to see if JSON is valid.
- **grunt clean** - Runs JSHint and beautifies JS to comply with our [contribution guidelines](https://github.com/mozilla/webmaker-events-2/blob/master/CONTRIBUTING.md). Checks to see if JSON is valid.
- **grunt build** - Used for building a production ready version of the app with minified and concatenated assets.
- **grunt test** - Run automated tests.

### A note on index.template

The file `index.template` has several tokens, which are replaced when `grunt` or `grunt build` are run.

When `grunt` is run for local development, the generated `index.html` will contain individual, non-minified JS files and CSS with source maps. It will also contain a live reload script.

When `grunt build` is run for a production ready build, `index.html` will only reference a few 3rd party JS libraries and `compiled/app.min.js`, which includes the scripts listed in the `scripts` array in `Gruntfile.js`. *Note that `grunt build` shouldn't be used for local development aside from testing.*

**Never modify index.html directly! It's machine generated and not meant to be modified by hand.**

## Localization

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
  This will check the translation file and look for that specific key name and return the message. If key name not found it will return **unknown key: "_some_key_name_"**.

2. `<span ng-bind-html="'_some_key_name' | i18n"></span>`

  This method is useful when you have some markup.

3. `<span bind-unsafe-html="'_some_key_name' | i18n"></span>`

  This method is useful when you have some variable inside your string for instance: "My name is {{name}}."

## Automated Testing

**The following require a local installation of Protractor via `npm install -g protractor`**

### Local Testing

This will test locally in Chrome using the tests outlined in `/test/spec.js`.

1. Run `grunt test`.

### Hosted Testing

Hosted testing with a [variety of browsers and devices](https://saucelabs.com/platforms) can be accomplished using a Sauce Labs account.

1. Sign up for a Sauce Labs account using the [free OSS project plan](https://saucelabs.com/opensauce).
2. Install Protractor with `npm install -g protractor`.
3. Install and run Sauce Connect by following [these instructions](https://docs.saucelabs.com/reference/sauce-connect/).
4. Copy `test/conf-sauce.js-dist` to `test/conf-sauce.js`.
5. Add your `sauceUser` and `sauceKey` credentials to `conf-sauce.js`.
6. Run `grunt build`.
7. Run `node server/server.js` to spawn a local web server.
8. Run `protractor test/conf-sauce.js`. If your tunnel is running properly you should see activity on your local server and the tests executing.
