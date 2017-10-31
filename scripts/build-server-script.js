'use strict';

const fs = require('fs');
const request = require('request');

const CONSTANTS = {
    SERVER_PORT:                process.env.SERVER_PORT,
    PROXY_SERVER_PORT:          process.env.PROXY_SERVER_PORT,
    SERVER_DOMAIN_NAME:         process.env.SERVER_DOMAIN_NAME,
    URL_APP_RELOAD_SERVER:      process.env.URL_APP_RELOAD_SERVER,
    URL_BROWSER_RELOAD_SERVER:  process.env.URL_BROWSER_RELOAD_SERVER,
};

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.error(`Build server script: You must set ${key} env!`);
        process.exit(1);
        return false;
    }
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
            uri: CONSTANTS.URL_APP_RELOAD_SERVER,
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
                uri: CONSTANTS.URL_BROWSER_RELOAD_SERVER,
                headers: {'socket-control-command': 'browser-refresh'},
                proxy: ''
            },
            handleResponse.bind(this, resolve, reject)
        );
    });
})
.then(() => {
    console.log('');
    console.log('=======================================');
    console.log(`SERVER RUNS ON: http://${CONSTANTS.SERVER_DOMAIN_NAME}:${CONSTANTS.SERVER_PORT}`);
    console.log(`LIVERELOAD SERVER RUNS ON: http://localhost:${CONSTANTS.PROXY_SERVER_PORT}`);
    console.log('=======================================');
    console.log('');

})
.catch(err => console.error(err));