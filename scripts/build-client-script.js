'use strict';

const { exec } = require('child_process');

const CONSTANTS = {
    SERVER_PORT:          process.env.SERVER_PORT,
    PROXY_SERVER_PORT:    process.env.PROXY_SERVER_PORT,
    SERVER_DOMAIN_NAME:   process.env.SERVER_DOMAIN_NAME
};

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.error(`Build client script: You must set ${key} env!`);
        process.exit(1);
        return false;
    }
}

new Promise((resolve, reject) => {
    exec(`node scripts/request-refresh-browser-script.js`, (error, stdout, stderr) => {
        if (error) {
            reject(error);
            return;
        }
        resolve();
    });
})
.then(()=>{
    console.log('');
    console.log('=======================================');
    console.log(`SERVER RUNS ON: http://${CONSTANTS.SERVER_DOMAIN_NAME}:${CONSTANTS.SERVER_PORT}`);
    console.log(`LIVERELOAD SERVER RUNS ON: http://localhost:${CONSTANTS.PROXY_SERVER_PORT}`);
    console.log('=======================================');
    console.log('');
})
.catch(err => console.error(err));