'use strict';

var _ = require('lodash'),
    webpack = require('webpack'),
    project = require('./package.json'),
    banner = _.template(
        '<%= name %> v<%= version %>\n' +
        '<%= description %>\n' +
        '@author <%= author.name %>, <%= author.url %>'
    )(project);

var config = {
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'eslint',
                exclude: /node_modules/
            }
        ],
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        library: 'Talaria',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['', '.js']
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.BannerPlugin(banner)
    ]
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compressor: {
            screw_ie8: true,
            warnings: false
        }
    }));
}

module.exports = config;
