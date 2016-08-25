var path = require("path");

module.exports = {

    // entry: "./src/main/ts/test.ts",
    entry: "./src/main/ts/Factory.ts",

    // needs population
    output: {
        // filename: "target/test_webpack.js", // needs population,
                filename: "target/dosistiltekst.js", // needs population,

         // export itself to a global var
        libraryTarget: "var",
        // name of the global var: "Foo"
        library: "dosistiltekst"
    },
    resolve: {
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    bail: true,
    debug: true,
    devtool: "source-map",
    module: {
        loaders: [
            // Load typescript source-files
            { test: /\.ts?$/, loader: "ts-loader", exclude: /\.d\.ts$/ },
        ]
    }
};
