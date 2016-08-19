var path = require('path');

module.exports = {
    entry: "./src/main/ts/LongTextConverter.ts",
     
    
    // needs population
    output: {
        filename: "target/dosistiltekst.js", // needs population,
         // export itself to a global var
        libraryTarget: "var",
        // name of the global var: "Foo"
        library: "dosistiltekst"
    },
    resolve: {
        extensions: ["", ".ts", ".js"],
        root: [
            path.resolve('./src/main/ts'),
            path.resolve('./src/main/ts/vowrapper'),
            path.resolve('./src/main/ts/longtextconverterimpl')
        ]
    },
    debug: true,
    devtool: 'source-map',
    module: {
        loaders: [
            // Load typescript source-files
            { test: /\.ts?$/, loader: 'ts-loader', exclude: /\.d\.ts$/ },
        ]
    }
};
