'use strict';

const SERVER_DOMAIN_NAME: string = (process.env as any).SERVER_DOMAIN_NAME || 'localhost';
const SERVER_PORT: string = (process.env as any).SERVER_PORT || (process.env as any).PORT || 80;

import * as fs from 'fs';
import * as ejs from 'ejs';
import * as http from 'http';
import makeResponseText from './modules/makeResponseText';

const server = http.createServer();
const debug = ((process.env as any).NODE_ENV === 'production') ? false : true;

server.on('request', (req, res) => {
	res.setStatus = 200;
	if ('/client/client-bundle.js' === req.url) {
		res.setHeader('Content-Type', 'text/javascript');
		fs.createReadStream(`${__dirname}/client/client-bundle.js`, 'utf-8').pipe(res);
		return false;
	}
	if ('/client/client-bundle.css' === req.url) {
		res.setHeader('Content-Type', 'text/css');
		fs.createReadStream(`${__dirname}/client/client-bundle.css`, 'utf-8').pipe(res);
		return false;
	}
	res.setHeader('Content-Type', 'text/html');
	let html = ejs.render(fs.readFileSync(__dirname + '/index.ejs', 'utf-8').toString(), {});
	res.write(makeResponseText());
	res.end(html);
}).listen(SERVER_PORT, () => {
	console.log(`Server is running on http://${SERVER_DOMAIN_NAME}:${SERVER_PORT}! ${new Date()}`);
});