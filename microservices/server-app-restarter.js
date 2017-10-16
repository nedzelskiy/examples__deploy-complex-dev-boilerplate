'use strict';

const types = {};
const http = require('http');
const respawn = require('respawn');
const server = http.createServer();
const utils = require('./microservices-utils');

const NAME = 'server-app-restarter';
const PORT = process.env.SAR_PORT || 8801;
const COLOR = process.env.SAR_COLOR || 'cyan';
const BOOTSTRAP = process.env.SAR_BOOTSTRAP || 'build/server.js';
const TIME_FOR_WAIT_AFTER_SERVER_STARTED = process.env.SAR_TFWASS || 500;
const ctx = {
    'name': NAME,
    'color': COLOR,
    'port': PORT,
    'types': types
};

const io = require('socket.io')(server);
const sendConsoleText = utils.sendConsoleText.bind(ctx);
server.on('request', utils.httpServerHandler.bind(ctx));
server.listen(PORT);

let appServer = null;

io.on('connection', (socket) => {
    socket.on('message', (message, cb) => {
        types[message.type] &&
        types[message.type]()
        .then(() => {
            cb && ('function' === typeof cb) && cb();
        })
        .catch((err) => sendConsoleText(err, 'error'));
    });
});

sendConsoleText(`started on ${PORT}`);


types['restart-app-server'] = () => {
    !types['restart-app-server'].promise &&
        (types['restart-app-server'].promise =

            new Promise((resolve, reject) => {
                !appServer && createAppServer();
                appServer.stop(() => {
                    appServer.start();
                    setTimeout(() => {
                        resolve();
                        types['restart-app-server'].promise = null;
                    }, TIME_FOR_WAIT_AFTER_SERVER_STARTED);
                });
            })

        );
    return types['restart-app-server'].promise;
};

types['get-commands'] = () => {
    return Promise.resolve(Object.keys(types).filter(command => command !== 'get-commands' ));
};

const createAppServer = () => {
    let env = {
        NODE_ENV: process.env.NODE_ENV || 'development'
    };
    for (let key in process.env) {
        env[key] = process.env[key];
    }
    appServer = respawn(['node', BOOTSTRAP], {
        env: env,
        fork: false,
        kill: 2000,
        maxRestarts: 0,
        stdio: 'inherit'
    });
};