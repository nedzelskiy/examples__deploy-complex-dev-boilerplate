'use strict';

const types = {};
const chalkInstance = require('chalk');

const PORT = process.env.SBR_PORT || 8802;
const COLOR = process.env.SBR_COLOR || 'magenta';

const io = require('socket.io')(PORT);
const chalk = new chalkInstance.constructor({enabled:true});

let socketToBrowser = null;

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
    socket.handshake.headers.origin &&
        ('node-XMLHttpRequest' !== socket.handshake.headers['user-agent']) &&
            (socketToBrowser = socket) &&
                sendConsoleText('connected to socked browser!');
};

io.on('connection', (socket) => {
    setSocketToBrowser(socket);
    socket.on('message', async (message, cb) => {
        types[message.type] &&
        types[message.type](socket)
        .then(() => {
            cb && ('function' === typeof cb) && cb();
        })
        .catch((err) => sendConsoleText(err, 'error'));
    });
});

sendConsoleText(`started on ${PORT}`);

types['browser-refresh'] = async () => {
    if (!socketToBrowser) {
        return Promise.reject('socketToBrowser doesn\'t exists yet!')
    }
    socketToBrowser.send({
        type: 'browser-refresh'
    });
    sendConsoleText(`refreshed browser on ${ new Date() }`);
    return Promise.resolve();
};

