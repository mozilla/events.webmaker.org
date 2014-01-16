module.exports = function (grunt) {

  grunt.initConfig({
    shell: {
      runServer: {
        options: {
          stdout: true,
          stderr: true
        },
        command: 'node server/server.js'
      }
    },
    jshint: {
      all: ['*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    jsbeautifier: {
      modify: {
        src: ['Gruntfile.js', 'app/js/**/*.js'],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      validate: {
        src: ['Gruntfile.js', 'app/js/**/*.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['shell:runServer']);

  // Clean code before a commit
  grunt.registerTask('clean', ['jsbeautifier:modify', 'jshint']);

  // Validate code (read only)
  grunt.registerTask('validate', ['jsbeautifier:validate', 'jshint']);

};
