'use strict';

const io = require('socket.io-client');
let socket = io.connect('http://localhost:8801');

new Promise((resolve, reject) => {
    socket.send({
        'type': 'restart-server',
        'bootstrap': 'build/app.js'
    }, resolve);
}).then(() => {
    socket.close();
    return new Promise((resolve, reject) => {
        socket = io.connect('http://localhost:8802');
        socket.send({
            'type': 'browser-refresh'
        }, resolve);
    });
}).then(() => {
    socket.close();
});