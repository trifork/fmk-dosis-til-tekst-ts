var path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
    mode: 'production',
    entry: "./src/main/ts/index.ts",
    target: "es5",
    output: {

        filename: "dosistiltekst.js",
        library: {
            // export itself to a global var
            type: "var",

            // name of the global var
            name: "dosistiltekst"
        },
        chunkFormat: "module"
    },
    // FOR THE SERVER VERSION, USE externals: [ list of node modules ]
    // externals: [ 'fs'],

    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    bail: true,
    devtool: "source-map",
    module: {
        rules: [
			{
				test: /\.ts$/,
				exclude: /\.d\.ts$|publish-internal|publish-public/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            tsconfig: 'tsconfig.unittest.json'
                        }
                    }
                ]
			}
		]
    },
    plugins: [
        new CheckerPlugin()
    ]
};
