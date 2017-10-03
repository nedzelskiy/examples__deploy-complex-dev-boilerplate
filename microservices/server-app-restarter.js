'use strict';

const types = {};
const http = require('http');
const respawn = require('respawn');
const server = http.createServer();
const chalkInstance = require('chalk');
const chalk = new chalkInstance.constructor({enabled:true});

const NAME = 'server-app-restarter';
const PORT = process.env.SAR_PORT || 8801;
const COLOR = process.env.SAR_COLOR || 'magenta';
const BOOTSTRAP = process.env.SAR_BOOTSTRAP || 'build/app.js';
const TIME_FOR_WAIT_AFTER_SERVER_STARTED = process.env.SAR_TFWASS || 500;
const HTTP_MICROSERVICE_FAIL_MESSAGE = process.env.SAR_HTTP_MICROSERVICE_FAIL_MESSAGE ||
`Error: Control command Header not found or wrong value!

Send Header 'socket-control-command' with 'get-commands' value for view list of possible values`;

const io = require('socket.io')(server);
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

server.on('request', (req, res) => {
    if  (!!~req.url.indexOf('socket.io')) {
        return false;
    }
    if ('/' !== req.url) {
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
