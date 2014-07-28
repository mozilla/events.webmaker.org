/* global require */
module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  grunt.initConfig({
    less: {
      development: {
        files: {
          'app/compiled/app.min.ltr.css': 'app/less/app.less'
        },
        options: {
          sourceMap: true,
          sourceMapBasepath: 'app',
          sourceMapRootpath: '/'
        }
      },
      production: {
        files: {
          'app/compiled/app.min.ltr.css': 'app/less/app.less'
        }
      }
    },
    watch: {
      less: {
        files: ['app/less/**/*.less', 'bower.json'],
        tasks: ['less:development']
      },
      server: {
        files: ['server/**/*', 'package.json'],
        tasks: ['shell:runServer']
      }
    },
    cssjanus: {
      'app/compiled/app.min.rtl.css': 'app/compiled/app.min.ltr.css',
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
    }
  });

  grunt.registerTask('default', ['less:development', 'cssjanus', 'shell:runServer', 'watch']);

  // Clean code before a commit
  grunt.registerTask('clean', ['jsbeautifier:modify', 'jsonlint', 'jshint', 'angular_i18n_finder']);

  // Validate code (read only)
  grunt.registerTask('validate', ['jsbeautifier:validate', 'jsonlint', 'jshint']);

  // Heroku
  grunt.registerTask('build', ['less:production', 'cssjanus']);

};
