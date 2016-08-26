'use strict';

module.exports = function (grunt) {

  var webpackConfig = require("./webpack.config.js");

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['target'],

    tslint: {
      options: {
        configuration: "tslint.json"
      },
      files: [
        "src/main/ts/**/*.ts",
        "src/main/ts/**/*.tsx"
      ]
    },

    'npm-publish': {
      options: {
        abortIfDirty: false
      }
    },

    webpack: {
      dosistiltekst: webpackConfig
    }
  });

  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);
  require('webpack');

  /*
    grunt.registerTask('default', 'Builds the project.', function() {
        const watch = grunt.option('watch');
        const webpack = grunt.config.get('webpack');
        if (watch && webpack) {
            Object.keys(webpack).forEach((entry) => {
                webpack[entry].watch = true;
                webpack[entry].keepalive = true;
                webpack[entry].failOnError = false;
            });
            grunt.config.set('webpack', webpack);
        }
        grunt.task.run('clean', 'tslint', 'webpack');
      });*/
  grunt.registerTask('default', ['clean', 'tslint', 'webpack']);

  grunt.registerTask('publish', ['default', 'npm-publish']);

}   //new GruntConfiguration(); 
