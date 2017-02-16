'use strict';

module.exports = function (grunt) {
	var webpackConfig = require("./webpack.config.js");
	var webpackCommonJSConfig = require("./webpack.commonjs.config");

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
		webpack: {
      		dosistiltekst: webpackConfig,
			dosistiltekstCommonJS: webpackCommonJSConfig
    	}
	});

	// Load all grunt tasks
	require('load-grunt-tasks')(grunt);
	grunt.registerTask('default', ['clean', 'tslint', 'ts']);
	grunt.registerTask('webpack-var', ['webpack:dosistiltekst']);
	grunt.registerTask('webpack-commonjs', ['webpack:dosistiltekstCommonJS']);
};
