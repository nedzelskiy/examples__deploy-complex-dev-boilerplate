'use strict';

const types = {};
const fs = require('fs');
const fse = require('fs-extra');
const http = require('http');
const request = require('request');
const server = http.createServer();
const Watcher = require('watch-fs').Watcher;
const util = require('./microservices-utils');
const recursive = require("recursive-readdir");


const NAME = 'server-static-watcher';
const PORT = process.env.SSW_PORT || 8803;
const COLOR = process.env.SSW_COLOR || 'green';
const DESTINATION = process.env.SERVER_BUILD_FOLDER || 'build';
const BOOTSTRAP = process.env.SERVER_SRC_FOLDER || 'src/server';
const URL_BROWSER_RELOAD_SERVER = process.env.URL_BROWSER_RELOAD_SERVER || 'http://localhost:8802';

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

var watcher = new Watcher({
    paths: [ BOOTSTRAP ],
    filters: {
        includeFile: function(name) {
            return !/\.tsx?/.test(name);
        }
    }
});

const doCopyFiles = () => {
    types['copy-server-static']()
        .then((files) => {
            sendConsoleText(`static files copied! ${files.toString()}`);
            return new Promise((resolve, reject) => {
                request(
                    {
                        uri: URL_BROWSER_RELOAD_SERVER,
                        headers: {'socket-control-command': 'browser-refresh'},
                        proxy: ''
                    },
                    (error, response, body) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        if (response.statusCode !== 200) {
                            reject({
                                body: body,
                                response: response
                            });
                            return;
                        }
                        resolve();
                    }
                );
            });
        })
        .catch(err => sendConsoleText(err, 'error'));
};

watcher.on('create', (name) => {
    sendConsoleText(`file ${name} created`);
    doCopyFiles();
});

watcher.on('change', (name) => {
    sendConsoleText(`file ${name} changed`);
    doCopyFiles();
});

watcher.on('delete', (name) => {
    sendConsoleText(`file ${name} deleted`);
    doCopyFiles();
});

watcher.start((err, failed) => {});

io.on('connection', (socket) => {

    socket.on('message', (message, cb) => {
        types[message.type] &&
        types[message.type]()
            .then((files) => {
                sendConsoleText(`static files copied! ${files.toString()}`);
                return new Promise((resolve, reject) => {
                    request(
                        {
                            uri: URL_BROWSER_RELOAD_SERVER,
                            headers: {'socket-control-command': 'browser-refresh'},
                            proxy: ''
                        },
                        (error, response, body) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            if (response.statusCode !== 200) {
                                reject({
                                    body: body,
                                    response: response
                                });
                                return;
                            }
                            resolve();
                        }
                    );
                });
            })
            .then(() => {
                cb && ('function' === typeof cb) && cb();
            })
            .catch((err) => sendConsoleText(err, 'error'));
    });
});

sendConsoleText(`started on ${PORT}`);
// TODO copy only changed file or all if not
// TODO settimeout promise !
types['copy-server-static'] = () => {
    if (!types['copy-server-static'].promise) {
        types['copy-server-static'].promise =
        new Promise((resolve, reject) => {
            recursive(
                BOOTSTRAP,
                [
                    (file, stats) => {
                        let ext = file.split('.').pop();
                        return !stats.isDirectory() &&  (ext === 'ts' || ext === 'tsx');
                    }
                ],
                (err, files) => {
                    if (err) {
                        setTimeout(() => { delete types['copy-server-static'].promise }, 0);
                        reject(err);
                        return false;
                    }
                    files.forEach(file => {
                        fse.outputFileSync(file.replace(BOOTSTRAP, DESTINATION), fs.readFileSync(file, 'utf-8'));
                    });
                    setTimeout(() => { delete types['copy-server-static'].promise }, 0);
                    resolve(files);
                }
            );
        });
    }
    return types['copy-server-static'].promise;
};

types['get-commands'] = () => {
    return Promise.resolve(Object.keys(types).filter(command => command !== 'get-commands' ));
};
