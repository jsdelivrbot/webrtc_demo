const webpack = require('webpack');
const path = require('path');

const vendors = ['immutable'];
const exportPath = './build/lib';

module.exports = {
    output: {
        path: path.resolve( __dirname, exportPath),
        filename: '[name].js',
        library: '[name]'
    },
    entry: {
        'lib': vendors
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.resolve( __dirname, exportPath + '/manifest-lib.json'),
            name: '[name]',
            context: __dirname
        })
    ]
};