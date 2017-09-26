'use strict';

const types = {};
const chalkInstance = require('chalk');

const PORT = process.env.SBR_PORT || 8802;
const COLOR = process.env.SBR_COLOR || 'magenta';

const io = require('socket.io')(PORT);
const chalk = new chalkInstance.constructor({enabled:true});

let socketsToBrowsers = {};

const sendConsoleText = (text, level) => {
    let textColor = '',
        type = level || 'info';
    (type === 'info') && (textColor = 'blue');
    (type === 'warn') && (textColor = 'yellow');
    (type === 'error') && (textColor = 'red');
    console[(type === 'error') ? 'error': 'log'](
        chalk[COLOR](`server-browser-restarter`) +
        chalk[textColor](`[${ type }]:`),
        chalk[textColor](text)
    );
};

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
            (isAnySocketsExists = true) &&
                socketsToBrowsers[key].send({ type: 'browser-refresh' }) &&
                    sendConsoleText(`refreshed browser on ${ new Date() }`);
    }
    return isAnySocketsExists ? Promise.resolve() : Promise.reject('socketToBrowser doesn\'t exists yet!');
};

