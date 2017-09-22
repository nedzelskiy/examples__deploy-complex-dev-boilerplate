'use strict';

const respawn = require('respawn');

const server = respawn(['node', 'build/index.js'], {
	env: {
		NODE_ENV: 'development'
	},
	fork: false,
	kill: 2000,
	maxRestarts: 0,
	stdio: 'inherit'
});

setTimeout(() => {
	server.stop(() => server.start());
}, 100);

server.on('start', async () => {
	await new Promise((resolve, reject) => { setTimeout(resolve, 1000); });
});



