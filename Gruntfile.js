/* global require */
module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  // Scripts to be concatenated and minified (in load order)
  // Use un-minified scripts if possible for more meaningful stack traces in development
  var scripts = [
    'app/bower_components/webmaker-analytics/analytics.js',
    'app/bower_components/eventEmitter/EventEmitter.js',
    'app/bower_components/momentjs/min/moment-with-langs.js',
    'app/bower_components/jquery/dist/jquery.js',
    'app/bower_components/selectize/dist/js/standalone/selectize.js',
    'app/bower_components/makeapi-client/src/make-api.js',
    'app/bower_components/angular/angular.js',
    'app/bower_components/angular-paginate-anything/src/paginate-anything.js',
    'app/bower_components/angular-sanitize/angular-sanitize.js',
    'app/bower_components/angular-resource/angular-resource.js',
    'app/bower_components/angular-route/angular-route.js',
    'app/bower_components/angular-animate/angular-animate.js',
    'app/bower_components/angular-bootstrap/ui-bootstrap.js',
    'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    'app/bower_components/makeapi-angular/dist/makeapi-angular.templates.js',
    'app/bower_components/makeapi-angular/dist/makeapi-angular.js',
    'app/bower_components/spiiin/src/spiiin.js',
    'app/bower_components/langmap/language-mapping-list.js',
    'app/bower_components/webmaker-login-ux/dist/min/ngWebmakerLogin.templates.min.js',
    'app/bower_components/webmaker-login-ux/dist/min/ngWebmakerLogin.min.js',

    // Be sure to use proper array style dependency injection for these Angular scripts
    // Improper dep injection will result in broken code post-compression
    'app/js/app.js',
    'app/js/services.js',
    'app/js/controllers.js',
    'app/js/filters.js',
    'app/js/directives.js',
    'app/js/i18n.js'
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
          'app/compiled/app.ltr.css': 'app/less/app.less'
        },
        options: {
          sourceMap: true,
          sourceMapBasepath: 'app',
          sourceMapRootpath: '/'
        }
      },
      production: {
        files: {
          'app/compiled/app.ltr.css': 'app/less/app.less'
        }
      }
    },
    watch: {
      less: {
        files: ['app/less/**/*.less', 'bower.json'],
        tasks: ['less:development'],
        options: {
          livereload: 35728,
          spawn: false
        }
      },
      assets: {
        files: ['app/img/**/*', 'app/js/**/*.js', 'app/views/**/*.html'],
        options: {
          livereload: 35728,
          spawn: false
        }
      },
      server: {
        files: ['server/**/*', 'package.json'],
        tasks: ['shell:runServer']
      }
    },
    cssjanus: {
      'app/compiled/app.rtl.uncss.autoprefixed.css': 'app/compiled/app.ltr.uncss.autoprefixed.css',
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
      },
      runTests: {
        command: './test/test.sh'
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
      all: ['Gruntfile.js', 'app/js/**/*.js'],
      options: {
        ignores: ['app/js/lib/**/*.js'],
        jshintrc: '.jshintrc'
      }
    },
    jsbeautifier: {
      modify: {
        src: ['Gruntfile.js', 'app/js/**/*.js', '!app/js/lib/**/*.js'],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      validate: {
        src: ['Gruntfile.js', 'app/js/**/*.js', '!app/js/lib/**/*.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    angular_i18n_finder: {
      files: ['app/index.html', 'app/views/*.html', 'app/views/**/*.html'],
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
        src: 'app/compiled/app.ltr.uncss.autoprefixed.css',
        dest: 'app/compiled/app.ltr.uncss.autoprefixed.min.css'
      },
      rtl: {
        src: 'app/compiled/app.rtl.uncss.autoprefixed.css',
        dest: 'app/compiled/app.rtl.uncss.autoprefixed.min.css'
      }
    },
    uncss: {
      production: {
        options: {
          // Add patterns for any selectors that target dynamically added HTML or attributes
          // Uncss won't include these selectors otherwise because it parses static templates
          ignore: [
            '.pagination > .active > a',
            /\.multicolor-header\.color-[0-9]/,
            /we-rsvp.*/,
            /\.dropdown-menu/,
            /\.navbar/,
            /(\[ng|\[data-ng|\[x-ng|\.ng|\.x).*/, // Angular bizness
            /\.listing-home.*/,
            /we-related-events.*/,
            /\.tooltip*/,
            /\.collapse\.in/,
            /\.collapsing/
          ],
          stylesheets: ['compiled/app.ltr.css']
        },
        files: {
          'app/compiled/app.ltr.uncss.css': ['app/index.html', 'app/views/**/*.html']
        }
      }
    },
    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      production: {
        src: 'app/compiled/app.ltr.uncss.css',
        dest: 'app/compiled/app.ltr.uncss.autoprefixed.css'
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
            replacement: '.uncss.autoprefixed.min'
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
            pattern: '<script src="/compiled/app.min.js"></script>',
            replacement: scriptIncludes
          }, {
            pattern: '%_LIVE_RELOAD_%',
            replacement: '<script src="//localhost:35728/livereload.js"></script>'
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
          'app/compiled/app.min.js': scripts
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
    'autoprefixer',
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

  // Testing
  grunt.registerTask('test', [
    'shell:runTests'
  ]);

};
