'use strict';

const types = {};
const http = require('http');
const server = http.createServer();
const util = require('./microservices-utils');


const CONSTANTS = {
    PORT:   process.env.SERVER_BROWSER_RESTARTER__PORT,
    COLOR:  process.env.SERVER_BROWSER_RESTARTER__COLOR || 'cyan'
};

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.error(`Build client script: You must set ${key} env!`);
        process.exit(1);
        return false;
    }
}

const NAME = 'server-browser-restarter';
const ctx = {
    'name': NAME,
    'color': CONSTANTS.COLOR,
    'port': CONSTANTS.PORT,
    'types': types
};
const io = require('socket.io')(server);
const sendConsoleText = util.sendConsoleText.bind(ctx);
server.on('request', util.httpServerHandler.bind(ctx));
server.listen(CONSTANTS.PORT);

let socketsToBrowsers = {};

const setSocketToBrowser = (socket) => {
    socketsToBrowsers[socket.id] = socket;
};

const isThisSocketToBrowser = (socket) => {
    return (socket.handshake.headers.origin &&
                ('node-XMLHttpRequest' !== socket.handshake.headers['user-agent'])
            ) ? true : false;
};

// TODO i don't see 'connected to socked browser!'
io.on('connection', (socket) => {
    if (isThisSocketToBrowser(socket)) {
        setSocketToBrowser(socket);
        sendConsoleText(`connected to socked browser[${socket.id}]!`);
    }

    socket.on('message', (message, cb) => {
        types[message.type] &&
        types[message.type]()
        .then(() => {
            cb && ('function' === typeof cb) && cb();
        })
        .catch((err) => sendConsoleText(err, 'error'));
    });
    socket.on('close', () => {
        delete socketsToBrowsers[socket.id];
        sendConsoleText(`browser connection[${socket.id}] closed!`);
    });
    socket.on('disconnect', () => {
        delete socketsToBrowsers[socket.id];
        sendConsoleText(`browser connection[${socket.id}] closed!`);
    });
});

sendConsoleText(`started on ${CONSTANTS.PORT}`);

types['browser-refresh'] = () => {
    if (!types['browser-refresh'].promise) {
        types['browser-refresh'].promise = new Promise((resolve, reject) => {
            let isAnySocketsExists = false;
            for (let key in socketsToBrowsers) {
                if (!socketsToBrowsers[key] || !socketsToBrowsers.hasOwnProperty(key)) {
                    continue;
                }
                isAnySocketsExists = true;
                socketsToBrowsers[key].send({ type: 'browser-refresh' });
                sendConsoleText(`refreshed browser [${key}] on ${ new Date() }`);
            }
            setTimeout(() => {
                types['browser-refresh'].promise = null;
            }, 0);
            isAnySocketsExists ? resolve() : reject('socketToBrowser doesn\'t exists yet!');
        });
    }
    return types['browser-refresh'].promise;
};

types['get-commands'] = () => {
    return Promise.resolve(Object.keys(types).filter(command => command !== 'get-commands' ));
};
