'use strict';

module.exports = function (grunt) {
	var webpackConfig = require("./webpack.config.js");
	var webpackCommonJSConfig = require("./webpack.commonjs.config");

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		clean: ['target', 'test/target', 'src/test/target'],

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
    	},

         copy: {
            dosisTilTekstCommonJS: {
                files: [
                    { src: 'target/dosistiltekst-commonjs.js*', dest: 'publish-internal/' },
                    { src: 'target/lib/*.d.ts', dest: 'publish-internal/' },
                    { src: 'target/lib/vowrapper/*.d.ts', dest: 'publish-internal/' },
                    { src: 'target/lib/longtextconverterimpl/*.d.ts', dest: 'publish-internal/' },
                    { src: 'target/lib/shorttextconverterimpl/*.d.ts', dest: 'publish-internal/' },
                    { src: 'target/lib/DosageProposalXMLGenerator/*.d.ts', dest: 'publish-internal/' }
                ]
            },
            copyForDosisTilTekst: {
                files: [
                    { src: 'target/dosistiltekst.js*', dest: 'publish-public/' },
                    { src: 'target/lib/*.d.ts', dest: 'publish-public/' },
                    { src: 'target/lib/vowrapper/*.d.ts', dest: 'publish-public/' },
                    { src: 'target/lib/longtextconverterimpl/*.d.ts', dest: 'publish-public/' },
                    { src: 'target/lib/shorttextconverterimpl/*.d.ts', dest: 'publish-public/' },
                    { src: 'target/lib/DosageProposalXMLGenerator/*.d.ts', dest: 'publish-public/' }
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

	grunt.registerTask('default', ['clean', 'tslint', 'ts', 'webpack-var', 'webpack-commonjs']);
	grunt.registerTask('webpack-var', ['webpack:dosistiltekst', 'copy:copyForDosisTilTekst']);
	grunt.registerTask('webpack-commonjs', ['webpack:dosistiltekstCommonJS','copy:dosisTilTekstCommonJS']);
};
