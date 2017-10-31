'use strict';

const types = {};
const http = require('http');
const respawn = require('respawn');
const server = http.createServer();
const utils = require('./microservices-utils');

const CONSTANTS = {
    PORT:                               process.env.SERVER_APP_RESTARTER__PORT,
    COLOR:                              process.env.SERVER_APP_RESTARTER__COLOR || 'cyan',
    LAUNCH_FILE:                        process.env.SERVER_APP_RESTARTER__LAUNCH_FILE,
    TIME_FOR_WAIT_AFTER_SERVER_STARTED: process.env.SERVER_APP_RESTARTER__TIME_FOR_WAIT_AFTER_SERVER_STARTED || 500
};

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.error(`Build client script: You must set ${key} env!`);
        process.exit(1);
        return false;
    }
}

const NAME = 'server-app-restarter';

const ctx = {
    'name': NAME,
    'color': CONSTANTS.COLOR,
    'port': CONSTANTS.PORT,
    'types': types
};

const io = require('socket.io')(server);
const sendConsoleText = utils.sendConsoleText.bind(ctx);
server.on('request', utils.httpServerHandler.bind(ctx));
server.listen(CONSTANTS.PORT);

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

sendConsoleText(`started on ${CONSTANTS.PORT}`);


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
                    }, CONSTANTS.TIME_FOR_WAIT_AFTER_SERVER_STARTED);
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
    appServer = respawn(['node', CONSTANTS.LAUNCH_FILE], {
        env: env,
        fork: false,
        kill: 2000,
        maxRestarts: 0,
        stdio: 'inherit'
    });
};