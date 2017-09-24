'use strict';

const APP_BOOTSTRAP = process.env.APP_BOOTSTRAP || 'build/app.js';
const URL_APP_RELOAD_SERVER = process.env.URL_APP_RELOAD_SERVER || 'http://localhost:8801';
const URL_BROWSER_RELOAD_SERVER = process.env.URL_BROWSER_RELOAD_SERVER || 'http://localhost:8802';

const io = require('socket.io-client');
let socket = io.connect(URL_APP_RELOAD_SERVER);

new Promise((resolve, reject) => {
    socket.send({
        'type': 'restart-app-server',
        'bootstrap': APP_BOOTSTRAP
    }, resolve);
}).then(() => {
    socket.close();
    return new Promise((resolve, reject) => {
        socket = io.connect(URL_BROWSER_RELOAD_SERVER);
        socket.send({
            'type': 'browser-refresh'
        }, resolve);
    });
}).then(() => {
    socket.close();
});