var path = require('path');

module.exports ={
    mode: 'production',
    entry: "./src/main/ts/index.ts",
    target: "web",
    output: {
        filename: "dosistiltekst-commonjs.js",
        library: {
            name: "dosistiltekst-commonjs",
            type: "commonjs"
        },
        chunkFormat: "module"
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