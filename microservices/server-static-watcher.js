'use strict';

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
const PORT = process.env.SSW_PORT || 8803;
const COLOR = process.env.SSW_COLOR || 'yellow';
const DESTINATION = process.env.SERVER_BUILD_FOLDER;
const BOOTSTRAP = process.env.SERVER_SRC_FOLDER;
const ON_SUCCESS_CALLBACK = process.env.SSW_SUCCESS_CALLBACK;

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

const watcher = new Watcher({
    paths: [ BOOTSTRAP ],
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
    fse.remove(fileName.replace(BOOTSTRAP, DESTINATION))
        .catch(err => {
            sendConsoleText(err, 'error');
        });
};

const copyFile = (fileName) => {
    let ext = fileName.split('.').pop();
    fse.outputFileSync(fileName.replace(BOOTSTRAP, DESTINATION), fs.readFileSync(fileName, 'utf-8'));
    return Promise.resolve([fileName]);
};

const copyAllFiles = () => {
    return new Promise((resolve, reject) => {
        recursive(
            BOOTSTRAP,
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
                    fse.outputFileSync(fileName.replace(BOOTSTRAP, DESTINATION), fs.readFileSync(fileName, 'utf-8'));
                });
                resolve(files);
            }
        );
    });
};

sendConsoleText(`started on ${PORT}`);

types['copy-server-static'] = (fileName) => {
    if (!DESTINATION) {
        let mess = 'DESTINATION not setted!';
        sendConsoleText(mess, 'error');
        return Promise.reject(mess);
    }
    if (!BOOTSTRAP) {
        let mess = 'BOOTSTRAP not setted!';
        sendConsoleText(mess, 'error');
        return Promise.reject(mess);
    }
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
                    if (ON_SUCCESS_CALLBACK) {
                        sendConsoleText(`starting callback task "${ON_SUCCESS_CALLBACK}" ...`);
                        exec(ON_SUCCESS_CALLBACK, (error, stdout, stderr) => {
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
