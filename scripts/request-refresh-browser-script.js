'use strict';

const URL_BROWSER_RELOAD_SERVER = process.env.URL_BROWSER_RELOAD_SERVER || 'http://localhost:8802';
const request = require('request');

new Promise((resolve, reject) => {
    request(
        {
            uri: URL_BROWSER_RELOAD_SERVER,
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