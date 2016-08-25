'use strict';

let webpackGruntFactory = function (overrides) {
    let baseConfig = {
        'npm-publish': {
            options: {
                abortIfDirty: false
            }
        },
        tslint: {
            options: {
                configuration: "tslint.json"
            },
            files: [
                "src/main/ts/**/*.ts",
                "src/main/ts/**/*.tsx"
            ]
        },
        copy: {
          js: [],
          css: []
        }
    };

    return function(grunt) {
        let config = Object.assign({}, baseConfig, overrides);
        grunt.initConfig(config);

        // Load all grunt tasks
        require('load-grunt-tasks')(grunt);

        // ----- Setup tasks
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
            grunt.task.run('clean', /*'tslint',*/ 'copy:js', 'copy:css', 'webpack');
        });
        grunt.registerTask('publish', ['default', 'npm-publish']);
    };
};

let tscGruntFactory = function (overrides) {
  let baseConfig = {
    'npm-publish': {
      options: {
        abortIfDirty: false
      }
    },
    ts: {
      default: {
        tsconfig: true
      }
    },
    tslint: {
      options: {
        configuration: "tslint.json"
      },
      files: [
        "src/main/ts/**/*.ts"
      ]
    }
  };


  return function(grunt) {
    let config = Object.assign({}, baseConfig, overrides);
    grunt.initConfig(config);

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // ----- Setup tasks
    grunt.registerTask('default', ['clean', 'tslint', 'ts']);
    grunt.registerTask('publish', ['default', 'npm-publish']);
  };
};


class GruntConfiguration {
  module(specifics) {
    return webpackGruntFactory(specifics);
  }
  library(specifics) {
    return tscGruntFactory(specifics);
  }
}

// module.exports = new GruntConfiguration();




module.exports = function(grunt) {

  var webpackConfig = require("./webpack.config.js");
  
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      clean: [ 'target' ],

      tslint: {
            options: {
                configuration: "tslint.json"
            },
            files: [
                "src/main/ts/**/*.ts",
                "src/main/ts/**/*.tsx"
            ]
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
