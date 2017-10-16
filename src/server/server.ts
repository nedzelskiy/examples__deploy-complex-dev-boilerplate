'use strict';

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
	if (debug) {
		const clientReloadScriptMaker = require('../scripts/build-client-reload-script');
		res.write(clientReloadScriptMaker.buildHtmlScript());
	}
	let html = ejs.render(fs.readFileSync(__dirname + '/index.ejs', 'utf-8').toString(), {});
	res.end(html);
}).listen(6766, () => {
	console.log(`Server is running on http://localhost:6766! ${new Date()}`);
});