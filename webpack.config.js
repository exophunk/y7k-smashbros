var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        main: './src/js/client/app.js'
    },
    output: {
        path: path.resolve("./public/build/js"),
        filename: 'app.js'
    },
    module: {
        loaders: [{loader: 'babel-loader'}]
    },
    resolve: {
        root: path.resolve('./src/js'),
        extensions: ['', '.js']
    },
    devtool: 'source-map',
    plugins: [
        //new webpack.optimize.UglifyJsPlugin()
    ]
};
