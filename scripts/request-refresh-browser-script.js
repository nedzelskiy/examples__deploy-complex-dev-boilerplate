'use strict';

const CONSTANTS = {
    URL_BROWSER_RELOAD_SERVER:  process.env.URL_BROWSER_RELOAD_SERVER
};

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.error(`Build client script: You must set ${key} env!`);
        process.exit(1);
        return false;
    }
}

const request = require('request');

new Promise((resolve, reject) => {
    request(
        {
            uri: CONSTANTS.URL_BROWSER_RELOAD_SERVER,
            headers: {'socket-control-command': 'browser-refresh'},
            proxy: ''
        },
        (error, response, body) => {
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
        }
    );
})
.catch(err => console.error(err));