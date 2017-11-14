'use strict';
const path = require('path');
const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');

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
.catch(err => console.log(`${FILENAME}:`, err));