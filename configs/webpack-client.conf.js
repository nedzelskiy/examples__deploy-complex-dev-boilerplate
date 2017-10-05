'use strict';

const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: '../src/client/client.tsx',
    output: {
        path: __dirname + `/../build/assets/`,
        filename: 'client-bundle.js',
        library: 'App'
    },
    watch: true,
    watchOptions: {
        aggregateTimeout: 20
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: "client.css"
        })
    ],
    devtool: 'source-map'
};