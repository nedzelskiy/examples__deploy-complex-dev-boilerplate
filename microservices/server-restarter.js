'use strict';

const types = {};
const port = 8801;
const respawn = require('respawn');
const io = require('socket.io')(port);

let server = null;

io.on('connection', (socket) => {
    socket.on('message', (message, cb) => {
        if ('undefined' !== types[message.type]) {
            types[message.type](message.bootstrap).then(() => {
                cb && ('function' === typeof cb) && cb();
            });
        }
    });
});

console.log(`server-restarter started on ${port}`);

const createServer = (bootstrap) => {
    server = respawn(['node', bootstrap], {
        env: {
            NODE_ENV: process.env.NODE_ENV || 'development'
        },
        fork: false,
        kill: 2000,
        maxRestarts: 0,
        stdio: 'inherit'
    });
};

types['restart-server'] = (bootstrap) => {
    return new Promise((resolve, reject) => {
        !server && createServer(bootstrap);
        server.stop(() => {
            server.start();
            setTimeout(resolve, 500);
        });
    });
};

