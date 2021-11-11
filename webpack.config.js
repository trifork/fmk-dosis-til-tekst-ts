var path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader')

module.exports = {
    mode: 'production',
    entry: "./src/main/ts/index.ts",

    output: {

        filename: "target/dosistiltekst.js",

        // export itself to a global var
        libraryTarget: "var",
        // name of the global var
        library: "dosistiltekst"
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
