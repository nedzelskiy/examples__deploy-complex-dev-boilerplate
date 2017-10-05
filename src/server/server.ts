'use strict';

import * as fs from 'fs';
import * as http from 'http';
import makeResponseText from './modules/makeResponseText';

const server = http.createServer();
const debug = ((process.env as any).NODE_ENV === 'production') ? false : true;

server.on('request', (req, res) => {
	res.setStatus = 200;
	if ('/client/client-bundle.js' === req.url) {
		fs.createReadStream(`${__dirname}/client/client-bundle.js`, 'utf-8').pipe(res);
		return false;
	}
	if ('/client/client-bundle.css' === req.url) {
		fs.createReadStream(`${__dirname}/client/client-bundle.css`, 'utf-8').pipe(res);
		return false;
	}
	res.setHeader('Content-Type', 'text/html');
	if (debug) {
		const clientReloadScriptMaker = require('../scripts/build-client-reload-script');
		res.end(`
			${ fs.readFileSync(`${__dirname}/index.html`, 'utf-8') } 
			${ clientReloadScriptMaker.buildHtmlScript() }
		`);
		return;
	}
	res.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
}).listen(6766, () => {
	console.log(`Server is running on http://localhost:6766! ${new Date()}`);
});