'use strict';

const types = {};
const http = require('http');
const server = http.createServer();
const chalkInstance = require('chalk');
const util = require('./microservices-utils');
const chalk = new chalkInstance.constructor({enabled:true});

const NAME = 'server-browser-restarter';
const PORT = process.env.SBR_PORT || 8802;
const COLOR = process.env.SBR_COLOR || 'magenta';
const ctx = {
    'name': NAME,
    'color': COLOR,
    'port': PORT,
    'types': types
};
const io = require('socket.io')(server);
const sendConsoleText = util.sendConsoleText.bind(ctx);
server.on('request', util.httpServerHandler.bind(ctx));
server.listen(PORT);

let socketsToBrowsers = {};

const setSocketToBrowser = (socket) => {
    socketsToBrowsers[socket.id] = socket;
};

const isThisSocketToBrowser = (socket) => {
    return (socket.handshake.headers.origin &&
                ('node-XMLHttpRequest' !== socket.handshake.headers['user-agent'])
            ) ? true : false;
};

io.on('connection', (socket) => {
    isThisSocketToBrowser(socket) &&
        setSocketToBrowser(socket) &&
            sendConsoleText('connected to socked browser!');

    socket.on('message', (message, cb) => {
        types[message.type] &&
        types[message.type](socket)
        .then(() => {
            cb && ('function' === typeof cb) && cb();
        })
        .catch((err) => sendConsoleText(err, 'error'));
    });
    socket.on('close', () => {
        delete socketsToBrowsers[socket.id];
    });
    socket.on('disconnect', () => {
        delete socketsToBrowsers[socket.id];
    });
});

sendConsoleText(`started on ${PORT}`);

types['browser-refresh'] = () => {
    let isAnySocketsExists = false;
    for (let key in socketsToBrowsers) {
        socketsToBrowsers[key] &&
            socketsToBrowsers.hasOwnProperty(key) &&
                (isAnySocketsExists = true) &&
                    socketsToBrowsers[key].send({ type: 'browser-refresh' }) &&
                        sendConsoleText(`refreshed browser on ${ new Date() }`);
    }
    return isAnySocketsExists ? Promise.resolve() : Promise.reject('socketToBrowser doesn\'t exists yet!');
};

types['get-commands'] = () => {
    return Promise.resolve(Object.keys(types).filter(command => command !== 'get-commands' ));
};
