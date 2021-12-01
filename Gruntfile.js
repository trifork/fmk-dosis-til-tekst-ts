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
				"./src/main/ts/**/*.ts"
			]
		},
		webpack: {
      		dosistiltekst: webpackConfig,
    	},

         copy: {
            dosisTilTekstCommonJS: {
                files: [
                    { src: './src/main/ts/*.ts', dest: 'publish-internal/' },
                    { src: 'dist/lib/*.d.ts', dest: 'publish-internal/' },
                    { src: 'dist/lib/vowrapper/*.d.ts', dest: 'publish-internal/' },
                    { src: 'dist/lib/longtextconverterimpl/*.d.ts', dest: 'publish-internal/' },
                    { src: 'dist/lib/shorttextconverterimpl/*.d.ts', dest: 'publish-internal/' },
                    { src: 'dist/lib/DosageProposalXMLGenerator/*.d.ts', dest: 'publish-internal/' }
                ]
            },
            copyForDosisTilTekst: {
                files: [
                    { src: 'dist/dosistiltekst.js*', dest: 'publish-public/' },
                    { src: 'dist/lib/*.d.ts', dest: 'publish-public/' },
                    { src: 'dist/lib/vowrapper/*.d.ts', dest: 'publish-public/' },
                    { src: 'dist/lib/longtextconverterimpl/*.d.ts', dest: 'publish-public/' },
                    { src: 'dist/lib/shorttextconverterimpl/*.d.ts', dest: 'publish-public/' },
                    { src: 'dist/lib/DosageProposalXMLGenerator/*.d.ts', dest: 'publish-public/' }
                ]
            },
            copyForPrepareTestSchemas: {
                files: [
                    { expand: true, cwd: '../fmk-schemas/etc/schemas/2015/01/01', src: '**/*.xsd', dest: '../schemas/2015/01/01/' },
                    { expand: true, cwd: '../fmk-schemas/etc/schemas/2015/06/01', src: '**/*.xsd', dest: '../schemas/2015/06/01/' },
                    { expand: true, cwd: '../fmk-schemas/etc/schemas/oio/', src: '**/*.xsd', dest: '../schemas/oio/' },
                    { src: '../fmk-schemas/etc/schemas/fmk-1.4.4-all-types.xsd', dest: '../schemas/fmk-1.4.4-all-types.xsd' },
                    { src: '../fmk-schemas/etc/schemas/fmk-1.4.6-all-types.xsd', dest: '../schemas/fmk-1.4.6-all-types.xsd' }
                ]
            },
            copyForPrepareTestSchemasOnJenkins: {
                files: [
                    { expand: true, cwd: '../../FMK_schema/workspace/etc/schemas/2015/01/01', src: '**/*.xsd', dest: '../schemas/2015/01/01/' },
                    { expand: true, cwd: '../../FMK_schema/workspace/etc/schemas/2015/06/01', src: '**/*.xsd', dest: '../schemas/2015/06/01/' },
                    { expand: true, cwd: '../../FMK_schema/workspace/etc/schemas/oio/', src: '**/*.xsd', dest: '../schemas/oio/' },
                    { src: '../../FMK_schema/workspace/etc/schemas/fmk-1.4.4-all-types.xsd', dest: '../schemas/fmk-1.4.4-all-types.xsd' },
                    { src: '../../FMK_schema/workspace/etc/schemas/fmk-1.4.6-all-types.xsd', dest: '../schemas/fmk-1.4.6-all-types.xsd' }
                ]
            }
         },
	});

	// Load all grunt tasks
	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['clean', 'tslint', 'ts', 'webpack-var', 'copy:dosisTilTekstCommonJS']);
	grunt.registerTask('webpack-var', ['webpack:dosistiltekst', 'copy:copyForDosisTilTekst']);
};
