'use strict';

module.exports = function (grunt) {
	var webpackConfig = require("./webpack.config.js");

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		clean: ['target'],

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
	grunt.registerTask('default', ['clean', 'tslint', 'ts', 'webpack']);
	grunt.registerTask('publish', ['npm-publish']);

};
