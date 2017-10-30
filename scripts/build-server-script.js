'use strict';

const fs = require('fs');
const request = require('request');
const recursive = require("recursive-readdir");

const URL_APP_RELOAD_SERVER = process.env.URL_APP_RELOAD_SERVER || 'http://localhost:8801';
const URL_BROWSER_RELOAD_SERVER = process.env.URL_BROWSER_RELOAD_SERVER || 'http://localhost:8802';
const SERVER_BUILD_FOLDER = process.env.SERVER_BUILD_FOLDER;
const INDEX_FILE_NAME = process.env.INDEX_FILE_NAME;

let needToStopScript = false;
let exitMessages = [];
if (!SERVER_BUILD_FOLDER) {
    exitMessages.push('Need to set SERVER_BUILD_FOLDER env first!');
    needToStopScript = true;
}
if (!INDEX_FILE_NAME) {
    exitMessages.push('Need to set INDEX_FILE_NAME env first!');
    needToStopScript = true;
}

if (needToStopScript) {
    console.error(exitMessages.toString());
    process.exit(1);
    return false;
}

const handleResponse = (resolve, reject, error, response, body) => {
    if (error) {
        reject(error);
        return;
    }
    if (response.statusCode !== 200) {
        reject({
            body: body,
            response: response
        });
        return;
    }
    resolve();
};

new Promise((resolve, reject) => {
    request(
        {
            uri: URL_APP_RELOAD_SERVER,
            headers: {'socket-control-command': 'restart-app-server'},
            proxy: ''
        },
        handleResponse.bind(this, resolve, reject)
    );
})
.then(() => {
    // add to index script for livereload
    return new Promise((resolve, reject) => {
        recursive(
            SERVER_BUILD_FOLDER,
            [
                (fileName, stats) => {
                    let ext = fileName.split('.').pop();
                    return !stats.isDirectory() && (!!!~fileName.indexOf('index.ejs'));
                }
            ],
            (err, files) => {
                if (err) {
                    reject(err);
                    return false;
                }
                console.log(files);
                resolve();
            }
        );
    });
})
.then(() => {
    return new Promise((resolve, reject) => {
        request(
            {
                uri: URL_BROWSER_RELOAD_SERVER,
                headers: {'socket-control-command': 'browser-refresh'},
                proxy: ''
            },
            handleResponse.bind(this, resolve, reject)
        );
    });
})
.catch(err => console.error(err));