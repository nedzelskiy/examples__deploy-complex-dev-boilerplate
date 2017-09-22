'use strict';

const cote = require('cote');
const monitor = require('respawn');

const server = monitor(['node', '../build/index.js'], {
    env: {
        NODE_ENV: 'development'
    },
    fork: false,
    kill: 2000,
    maxRestarts: 0,
    stdio: 'inherit'
});
const subscriber = new cote.Subscriber({ name: 'server starter subscriber' });

subscriber.on('update rate', (req) => {
    console.log('ss');
    server.stop(() => server.start());
    console.log('server restated!');
});

const EventEmitter = require('eventemitter2').EventEmitter2;

const eventEmitter = new EventEmitter();
eventEmitter.on('update rate', (req) => {

    console.log('ss');
});