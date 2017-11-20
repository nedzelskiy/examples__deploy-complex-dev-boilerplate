'use strict';

const SERVER__PORT: string = (process.env as any).SERVER__PORT || (process.env as any).PORT || 80;
const SERVER__URL: string = (process.env as any).SERVER__URL || `http://localhost:${SERVER__PORT}`;

import * as fs from 'fs';
import * as ejs from 'ejs';
import * as http from 'http';
import * as mime from 'mime';
import * as path from 'path';
import makeResponseText from './modules/makeResponseText';

const server = http.createServer();
const DEBUG = ((process.env as any).NODE_ENV === 'production') ? false : true;

server.on('request', (req, res) => {
	res.setStatus = 200;
	if ('/' !== req.url) {
		try {
			let file = fs.readFileSync(`${ path.normalize (__dirname + req.url) }`)
				,mimeType = mime.getType(`${ path.normalize (__dirname + req.url) }`)
				;
			res.setHeader('Content-Type', mimeType);
			res.end(file);
		} catch (err) {
			res.setStatus = 404;
			res.end('Not found!');
		}
		return;
	}
	res.setHeader('Content-Type', 'text/html');
	let html = ejs.render(fs.readFileSync(__dirname + '/index.ejs', 'utf-8').toString(), {
		serverRenderText: makeResponseText(),
		title: 'Welcome to boilerplate'
	});
	res.end(html);
}).listen(SERVER__PORT, () => {
	console.log(`Server is running on ${SERVER__URL} ${new Date()}`);
});

export default server;