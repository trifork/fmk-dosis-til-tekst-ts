var path = require('path');

module.exports = {

    entry: "./src/main/ts/Factory.ts",

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
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        modulesDirectories: [ "node_modules" ]
    },
    bail: true,
    debug: true,
    devtool: "source-map",
    module: {
        loaders: [
            // Load typescript source-files
            { test: /\.ts?$/, loader: "ts-loader", exclude: /\.d\.ts$/ },
        ]
    },
    

};
