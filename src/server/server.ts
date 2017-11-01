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
	if ('/' !== req.url) {
		try {
			let file = fs.readFileSync(`${__dirname}${req.url}`);
			res.end(file);
		} catch (err) {
			res.setStatus = 404;
			res.end('Not found!');
		}
		// let fileStream = fs.createReadStream(`${__dirname}${req.url}`);
		// // res.setHeader('Content-Type', `image/${ req.url.split('.').pop() }`);
		// fileStream
         //    .on('error', err => {
		// 		res.setHeader('Content-Type', 'text/plain');
         //    	if (err.code === 'ENOENT') {
		// 			res.setStatus = 404;
		// 			res.end('Not found!');
		// 		} else {
		// 			if (!res.headersSent) {
		// 				res.setStatus = 500;
		// 				res.end('Internal error!');
		// 			} else {
		// 				res.end('Some error occurred!');
		// 			}
		// 		}
		// 	})
         //    .pipe(res);
		return;
	}
	res.setHeader('Content-Type', 'text/html');
	let html = ejs.render(fs.readFileSync(__dirname + '/index.ejs', 'utf-8').toString(), {});
	res.write(makeResponseText());
	res.end(html);
}).listen(SERVER_PORT, () => {
	console.log(`Server is running on http://${SERVER_DOMAIN_NAME}:${SERVER_PORT}! ${new Date()}`);
});