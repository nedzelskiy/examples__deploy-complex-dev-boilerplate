'use strict';

const types = {};
const http = require('http');
const server = http.createServer();
const chalkInstance = require('chalk');
const chalk = new chalkInstance.constructor({enabled:true});

const PORT = process.env.SBR_PORT || 8802;
const COLOR = process.env.SBR_COLOR || 'magenta';
const NAME = 'server-browser-restarter';
const HTTP_MICROSERVICE_FAIL_MESSAGE = process.env.SBR_HTTP_MICROSERVICE_FAIL_MESSAGE ||
`Error: Control command Header not found or wrong value!

Send Header 'socket-control-command' with 'get-commands' value for view list of possible values`;


const io = require('socket.io')(server);
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

server.on('request', (req, res) => {
    if  (!!~req.url.indexOf('socket.io')) {
        return false;
    }
    if ('/' !== req.url ) {
        res.statusCode = 400;
        res.end('only url "/" allowed');
        return false;
    }
    const header = req.headers['socket-control-command'];
    if (!header || !types[header]) {
        res.statusCode = 400;
        res.end(`Hello form microservice: ${NAME}. ${HTTP_MICROSERVICE_FAIL_MESSAGE}`);
        return false;
    }
    res.statusCode = 200;
    types[header] && types[header]()
        .then(result => {
            res.end(result ? JSON.stringify(result) : 'ok!');
        })
        .catch((err) => {
            sendConsoleText(err, 'error');
            res.end(JSON.stringify(err));
        });
});


function sendConsoleText(text, level) {
    let textColor = '',
        type = level || 'info';
    (type === 'info') && (textColor = 'blue');
    (type === 'warn') && (textColor = 'yellow');
    (type === 'error') && (textColor = 'red');
    console[(type === 'error') ? 'error': 'log'](
        chalk[COLOR](NAME + ':' + PORT) +
        chalk[textColor](`[${ type }]:`),
        chalk[textColor](text)
    );
}
