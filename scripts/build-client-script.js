'use strict';

const URL_BROWSER_RELOAD_SERVER = process.env.URL_BROWSER_RELOAD_SERVER || 'http://localhost:8802';

const request = require('request');
const { exec } = require('child_process');

new Promise((resolve, reject) => {
    exec(`node scripts/request-refresh-browser-script.js`, (error, stdout, stderr) => {
        if (error) {
            reject(error);
            return;
        }
        resolve();
    });
})
.catch(err => console.error(err));