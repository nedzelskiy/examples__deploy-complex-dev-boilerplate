'use strict';

const fs = require('fs');
const request = require('request');

const URL_APP_RELOAD_SERVER = process.env.URL_APP_RELOAD_SERVER || 'http://localhost:8801';
const URL_BROWSER_RELOAD_SERVER = process.env.URL_BROWSER_RELOAD_SERVER || 'http://localhost:8802';

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