var path = require('path');

module.exports ={

    entry: "./src/main/ts/index.ts",

    output: {
        filename: "target/dosistiltekst-commonjs.js",
        libraryTarget: "commonjs2",
        library: "dosistiltekst-commonjs"
    },

    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    bail: true,
    devtool: "source-map",
    module: {
        loaders: [
			{
				test: /\.ts$/,
				exclude: /\.d\.ts$|publish-internal|publish-public/,
				loader: 'awesome-typescript-loader?tsconfig=tsconfig.unittest.json'
			}
		]
    },
};