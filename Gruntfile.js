/* global require */
module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  // Scripts to be concatenated and minified (in load order)
  // Use un-minified scripts if possible for more meaningful stack traces in development
  var scripts = [
    'app/_bower_components/webmaker-analytics/analytics.js',
    'app/_bower_components/eventEmitter/EventEmitter.js',
    'app/_bower_components/webmaker-auth-client/dist/webmaker-auth-client.min.js',
    'app/_bower_components/momentjs/min/moment-with-langs.js',
    'app/_bower_components/jquery/dist/jquery.js',
    'app/_bower_components/selectize/dist/js/standalone/selectize.js',
    'app/_bower_components/makeapi-client/src/make-api.js',
    'app/_bower_components/angular/angular.js',
    'app/_bower_components/angular-paginate-anything/src/paginate-anything.js',
    'app/_bower_components/angular-sanitize/angular-sanitize.js',
    'app/_bower_components/angular-resource/angular-resource.js',
    'app/_bower_components/angular-route/angular-route.js',
    'app/_bower_components/angular-animate/angular-animate.js',
    'app/_bower_components/angular-bootstrap/ui-bootstrap.js',
    'app/_bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    'app/_bower_components/makeapi-angular/dist/makeapi-angular.templates.js',
    'app/_bower_components/makeapi-angular/dist/makeapi-angular.js',

    // Be sure to use proper array style dependency injection for these Angular scripts
    // Improper dep injection will result in broken code post-compression
    'app/_js/app.js',
    'app/_js/services.js',
    'app/_js/controllers.js',
    'app/_js/filters.js',
    'app/_js/directives.js',
    'app/_js/i18n.js'
  ];

  // Generate HTML to include individual scripts for local development
  var scriptIncludes = '';

  scripts.forEach(function (script) {
    script = script.replace('app/', '');
    scriptIncludes += '<script src="/' + script + '"></script>';
  });

  grunt.initConfig({
    less: {
      development: {
        files: {
          'app/_compiled/app.ltr.css': 'app/_less/app.less'
        },
        options: {
          sourceMap: true,
          sourceMapBasepath: 'app',
          sourceMapRootpath: '/'
        }
      },
      production: {
        files: {
          'app/_compiled/app.ltr.css': 'app/_less/app.less'
        }
      }
    },
    watch: {
      less: {
        files: ['app/_less/**/*.less', 'bower.json'],
        tasks: ['less:development'],
        options: {
          livereload: true,
          spawn: false
        }
      },
      assets: {
        files: ['app/_img/**/*', 'app/_js/**/*.js', 'app/_views/**/*.html'],
        options: {
          livereload: true,
          spawn: false
        }
      },
      server: {
        files: ['server/**/*', 'package.json'],
        tasks: ['shell:runServer']
      }
    },
    cssjanus: {
      'app/_compiled/app.rtl.uncss.css': 'app/_compiled/app.ltr.uncss.css',
      options: {
        swapLtrRtlInUrl: true,
        swapLeftRightInUrl: false,
        generateExactDuplicates: false
      }
    },
    shell: {
      runServer: {
        options: {
          async: true
        },
        command: 'node server/server.js'
      }
    },
    jsonlint: {
      json: {
        src: [
          'bower.json',
          'package.json',
          'locale/**/*.json'
        ]
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'app/_js/**/*.js'],
      options: {
        ignores: ['app/_js/lib/**/*.js'],
        jshintrc: '.jshintrc'
      }
    },
    jsbeautifier: {
      nmodify: {
        src: ['Gruntfile.js', 'app/_js/**/*.js', '!app/_js/lib/**/*.js'],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      validate: {
        src: ['Gruntfile.js', 'app/_js/**/*.js', '!app/_js/lib/**/*.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    angular_i18n_finder: {
      files: ['app/index.html', 'app/_views/*.html', 'app/_views/**/*.html'],
      options: {
        pathToJSON: ['locale/en_US/*.json'],
        ignoreKeys: []
      }
    },
    cssmin: {
      options: {
        keepSpecialComments: 0
      },
      ltr: {
        src: 'app/_compiled/app.ltr.uncss.css',
        dest: 'app/_compiled/app.ltr.uncss.min.css'
      },
      rtl: {
        src: 'app/_compiled/app.rtl.uncss.css',
        dest: 'app/_compiled/app.rtl.uncss.min.css'
      }
    },
    uncss: {
      production: {
        options: {
          ignore: ['.pagination > .active > a', /\.multicolor-header\.color-[0-9]/, /we-rsvp.*/, /\.dropdown-menu/, /\.navbar/],
          stylesheets: ['_compiled/app.ltr.css'],
          urls: ['http://localhost:1981/', 'http://localhost:1981/#/events'] // Deprecated
        },
        files: {
          'app/_compiled/app.ltr.uncss.css': ['app/index.html', 'app/_views/**/*.html']
        }
      }
    },
    'string-replace': {
      production: {
        files: {
          'app/index.html': 'app/index.template'
        },
        options: {
          replacements: [{
            pattern: '%_EXTENSIONS_%',
            replacement: '.uncss.min'
          }, {
            pattern: '%_LIVE_RELOAD_%',
            replacement: ''
          }]
        }
      },
      development: {
        files: {
          'app/index.html': 'app/index.template'
        },
        options: {
          replacements: [{
            pattern: '%_EXTENSIONS_%',
            replacement: ''
          }, {
            pattern: '<script src="/_compiled/app.min.js"></script>',
            replacement: scriptIncludes
          }, {
            pattern: '%_LIVE_RELOAD_%',
            replacement: '<script src="//localhost:35729/livereload.js"></script>'
          }]
        }
      }
    },
    uglify: {
      options: {
        sourceMap: true
      },
      production: {
        files: {
          'app/_compiled/app.min.js': scripts
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell-spawn');

  // Run in "dev mode"
  grunt.registerTask('default', [
    'string-replace:development',
    'shell:runServer',
    'less:development',
    'watch'
  ]);

  // Build project for deployment to production
  grunt.registerTask('build', [
    'string-replace:production',
    'shell:runServer',
    'less:production',
    'uncss',
    'cssjanus',
    'cssmin',
    'uglify',
    'shell:runServer:kill'
  ]);

  // Clean code before a commit
  grunt.registerTask('clean', [
    'jsbeautifier:modify',
    'jsonlint',
    'jshint',
    'angular_i18n_finder'
  ]);

  // Validate code before commit (read only)
  grunt.registerTask('validate', [
    'jsbeautifier:validate',
    'jsonlint',
    'jshint'
  ]);
};
