'use strict';

const CONSTANTS = {
    SERVER_STATIC_WATCHER__PORT:    process.env.SERVER_STATIC_WATCHER__PORT,
    SERVER_STATIC_WATCHER__COLOR:   process.env.SERVER_STATIC_WATCHER__COLOR || 'yellow',
    SERVER_SRC_FOLDER:              process.env.SERVER_SRC_FOLDER,
    SERVER_BUILD_FOLDER:            process.env.SERVER_BUILD_FOLDER,
    ON_SUCCESS_CALLBACK:            process.env.SERVER_STATIC_WATCHER__SUCCESS_CALLBACK,
};

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.error(`Build client script: You must set ${key} env!`);
        process.exit(1);
        return false;
    }
}

const types = {};
const fs = require('fs');
const fse = require('fs-extra');
const http = require('http');
const request = require('request');
const server = http.createServer();
const { exec } = require('child_process');
const Watcher = require('watch-fs').Watcher;
const util = require('./microservices-utils');
const recursive = require("recursive-readdir");
const NAME = 'server-static-watcher';


const ctx = {
    'name': NAME,
    'color': CONSTANTS.SERVER_STATIC_WATCHER__COLOR,
    'port': CONSTANTS.SERVER_STATIC_WATCHER__PORT,
    'types': types
};
const io = require('socket.io')(server);
const sendConsoleText = util.sendConsoleText.bind(ctx);
server.on('request', util.httpServerHandler.bind(ctx));
server.listen(CONSTANTS.SERVER_STATIC_WATCHER__PORT);

const watcher = new Watcher({
    paths: [ CONSTANTS.SERVER_SRC_FOLDER ],
    filters: {
        includeFile: function(name) {
            return !/\.tsx?/.test(name);
        }
    }
});


watcher.on('create', (name) => {
    sendConsoleText(`file ${name} created`);
    types['copy-server-static'](name);
});

watcher.on('change', (name) => {
    sendConsoleText(`file ${name} changed`);
    types['copy-server-static'](name);
});

watcher.on('delete', (name) => {
    sendConsoleText(`file ${name} deleted`);
    deleteFile(name);
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

const blockedExt = [
    'ts',
    'tsx'
];

const deleteFile = (fileName) => {
    fse.remove(fileName.replace(CONSTANTS.SERVER_SRC_FOLDER, CONSTANTS.SERVER_BUILD_FOLDER))
        .catch(err => {
            sendConsoleText(err, 'error');
        });
};

const copyFile = (fileName) => {
    let ext = fileName.split('.').pop();
    fse.outputFileSync(fileName.replace(CONSTANTS.SERVER_SRC_FOLDER, CONSTANTS.SERVER_BUILD_FOLDER), fs.readFileSync(fileName, 'utf-8'));
    return Promise.resolve([fileName]);
};

const copyAllFiles = () => {
    return new Promise((resolve, reject) => {
        recursive(
            CONSTANTS.SERVER_SRC_FOLDER,
            [
                (fileName, stats) => {
                    let ext = fileName.split('.').pop();
                    return !stats.isDirectory() && blockedExt.reduce((bool, extension) => {
                        return extension === ext ? !!(++bool) : !!bool
                    }, false);
                }
            ],
            (err, files) => {
                if (err) {
                    reject(err);
                    return false;
                }
                files.forEach(fileName => {
                    fse.outputFileSync(fileName.replace(CONSTANTS.SERVER_SRC_FOLDER, CONSTANTS.SERVER_BUILD_FOLDER), fs.readFileSync(fileName, 'utf-8'));
                });
                resolve(files);
            }
        );
    });
};

sendConsoleText(`started on ${CONSTANTS.SERVER_STATIC_WATCHER__PORT}`);

types['copy-server-static'] = (fileName) => {
    if (!types['copy-server-static'].promise) {
        types['copy-server-static'].promise =
        new Promise((resolve, reject) => {
            let promise_ = (fileName) ? copyFile(fileName) : copyAllFiles();
            promise_
                .then((files)=> {
                    setTimeout(() => {
                        delete types['copy-server-static'].promise
                    }, 0);
                    sendConsoleText(`static files copied! ${files.toString()}`);
                    if (CONSTANTS.ON_SUCCESS_CALLBACK) {
                        sendConsoleText(`starting callback task "${CONSTANTS.ON_SUCCESS_CALLBACK}" ...`);
                        exec(CONSTANTS.ON_SUCCESS_CALLBACK, (error, stdout, stderr) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                })
                .catch(err => {
                    setTimeout(() => {
                        delete types['copy-server-static'].promise
                    }, 0);
                    reject(err);
                });
        });
    }
    return types['copy-server-static'].promise;
};

types['get-commands'] = () => {
    return Promise.resolve(Object.keys(types).filter(command => command !== 'get-commands' ));
};

types['copy-server-static']();
