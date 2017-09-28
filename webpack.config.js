'use strict';

const webpack = require('webpack');
const {name, version, description, author} = require('./package.json');
const banner = [
    `${name} v${version}`,
    description,
    `@author ${author.name}, ${author.url}`
].join('\n')

module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        library: 'FetchPlease',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.js']
    },
    plugins: [
        new webpack.BannerPlugin({banner})
    ]
};
