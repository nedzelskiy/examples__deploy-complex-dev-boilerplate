'use strict';

const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
    entry: './src/client/client.tsx',
    output: {
        path: __dirname + `/../build/client/`,
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
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        configFile: "../../configs/tsconfig-client.json"
                    }
                },
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
            filename: "client-bundle.css"
        }),
        new WebpackShellPlugin({
            onBuildExit:['node ./scripts/build-client-script.js']
        })
    ],
    devtool: 'source-map'
};