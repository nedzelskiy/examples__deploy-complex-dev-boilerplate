'use strict';

const types = {};
const port = 8802;
const io = require('socket.io')(port);

let browserSocket = null;

io.on('connection', function (socket) {
    socket.on('message', (message, cb) => {
        if ('undefined' !== types[message.type]) {
            types[message.type](socket).then(() => {
                cb && ('function' === typeof cb) && cb();
            }).catch(() => {});
        }
    });
});

console.log(`server-browser-restarter started on ${port}`);

types['browser-register'] = (socket) => {
    browserSocket = socket;
    return Promise.resolve();
};

types['browser-refresh'] = () => {
    if (browserRefresh()) {
        return Promise.reject();
    }
    return Promise.resolve();
};

const browserRefresh = () => {
    if (browserSocket) {
        browserSocket.send({
            type: 'browser-refresh'
        });
        console.log(`server-browser-restarter: refresh browser on ${ new Date() }`);
        return true;
    }
    return false;
};