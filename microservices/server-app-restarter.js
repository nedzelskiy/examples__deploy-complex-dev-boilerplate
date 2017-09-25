'use strict';

const types = {};
const respawn = require('respawn');
const chalkInstance = require('chalk');

const PORT = process.env.SAR_PORT || 8801;
const COLOR = process.env.SAR_COLOR || 'magenta';
const TIME_FOR_WAIT_AFTER_SERVER_STARTED = process.env.SAR_TFWASS || 500;

const io = require('socket.io')(PORT);
const chalk = new chalkInstance.constructor({enabled:true});

let appServer = null;

const sendConsoleText = (text, level) => {
    let textColor = '',
        type = level || 'info';
    (type === 'info') && (textColor = 'blue');
    (type === 'warn') && (textColor = 'yellow');
    (type === 'error') && (textColor = 'red');
    console[(type === 'error') ? 'error': 'log'](
        chalk[COLOR](`server-app-restarter`) +
        chalk[textColor](`[${ type }]:`),
        chalk[textColor](text)
    );
};

io.on('connection', (socket) => {
    socket.on('message', (message, cb) => {
        types[message.type] &&
        types[message.type](message.bootstrap)
        .then(() => {
            cb && ('function' === typeof cb) && cb();
        })
        .catch((err) => sendConsoleText(err, 'error'));
    });
});

sendConsoleText(`started on ${PORT}`);

const createAppServer = (bootstrap) => {
    let env = {
        NODE_ENV: process.env.NODE_ENV || 'development'
    };
    for (let key in process.env) {
        env[key] = process.env[key];
    }
    appServer = respawn(['node', bootstrap], {
        env: env,
        fork: false,
        kill: 2000,
        maxRestarts: 0,
        stdio: 'inherit'
    });
};

types['restart-app-server'] = (bootstrap) => {
    return new Promise((resolve, reject) => {
        !appServer && createAppServer(bootstrap);
        appServer.stop(() => {
            appServer.start();
            setTimeout(resolve, TIME_FOR_WAIT_AFTER_SERVER_STARTED);
        });
    });
};

types['set-app-server'] = (bootstrap) => {
    createAppServer(bootstrap);
    return Promise.resolve();
};

types['delete-app-server'] = () => {
    appServer = null;
    return Promise.resolve();
};

