var path = require('path');

module.exports ={
    mode: 'production',
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
        rules: [
			{
				test: /\.ts$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            tsconfig: 'tsconfig.unittest.json'
                        }
                    }
                ],

				exclude: /\.d\.ts$|publish-internal|publish-public/
			}
		]
    },
};