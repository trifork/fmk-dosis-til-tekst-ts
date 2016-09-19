'use strict';

module.exports = function (grunt) {
	var webpackConfig = require("./webpack.config.js");

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		clean: {
			pre: ['target'],
			post: ['target/lib/*.ts']
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
	grunt.registerTask('default', ['clean:pre', 'tslint', 'ts', 'webpack', 'clean:post']);
	grunt.registerTask('publish', ['default', 'npm-publish']);

};
