'use strict';

const path = require('path');
const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');

const CONSTANTS = {
    SERVER__SRC_TEST_FOLDER:                   process.env.SERVER__SRC_TEST_FOLDER,
    SERVER_TESTS_WATCHER__PORT:                process.env.SERVER_TESTS_WATCHER__PORT,
    SERVER_TESTS_WATCHER__COLOR:               process.env.SERVER_TESTS_WATCHER__COLOR || 'greenBright',
    SERVER_TESTS_WATCHER__SUCCESS_CALLBACK:    process.env.SERVER_TESTS_WATCHER__SUCCESS_CALLBACK
};

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.log(`${FILENAME}: You must set ${key} env!`);
        process.exit(1);
    }
}

CONSTANTS.SERVER__SRC_TEST_FOLDER = path.normalize(CONSTANTS.SERVER__SRC_TEST_FOLDER);
CONSTANTS.SERVER_TESTS_WATCHER__SUCCESS_CALLBACK = path.normalize(CONSTANTS.SERVER_TESTS_WATCHER__SUCCESS_CALLBACK);

const types = {};
const http = require('http');
const request = require('request');
const server = http.createServer();
const exec = require('child_process').exec;
const Watcher = require('watch-fs').Watcher;
const util = require('./microservices-utils');

const ctx = {
    'name': FILENAME,
    'color': CONSTANTS.SERVER_TESTS_WATCHER__COLOR,
    'port': CONSTANTS.SERVER_TESTS_WATCHER__PORT,
    'types': types,
    'process': process
};
const io = require('socket.io')(server);
const sendConsoleText = util.sendConsoleText.bind(ctx);
server.on('request', util.httpServerHandler.bind(ctx));
server.listen(CONSTANTS.SERVER_TESTS_WATCHER__PORT);

const watcher = new Watcher({
    paths: [ CONSTANTS.SERVER__SRC_TEST_FOLDER ],
    filters: {
        includeFile: function(name) {
            return /[sS]pec\.[a-zA-Z]+$/.test(name);
        }
    }
});

const runCallBack = () => {
    if (CONSTANTS.SERVER_TESTS_WATCHER__SUCCESS_CALLBACK) {
        sendConsoleText(`starting callback task "${CONSTANTS.SERVER_TESTS_WATCHER__SUCCESS_CALLBACK}" ...`);
        exec(CONSTANTS.SERVER_TESTS_WATCHER__SUCCESS_CALLBACK, (error, stdout, stderr) => {
            if (error) {
                console.log(error, 'err');
            } else {
                console.log(stdout);
            }
        });
    }
};

watcher.on('create', (name) => {
    sendConsoleText(`file ${name} created`);
    types['run-success-callback']();
});

watcher.on('change', (name) => {
    sendConsoleText(`file ${name} changed`);
    types['run-success-callback']();
});

watcher.on('delete', (name) => {
    sendConsoleText(`file ${name} deleted`);
    types['run-success-callback']();
});

watcher.start((err, failed) => {});

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

sendConsoleText(`started on ${CONSTANTS.SERVER_TESTS_WATCHER__PORT}`);


types['get-commands'] = () => {
    return Promise.resolve(Object.keys(types).filter(command => command !== 'get-commands' ));
};

types['run-success-callback'] = () => {
    runCallBack();
};

