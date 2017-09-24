'use strict';

import * as http from 'http';
import makeResponseText from './modules/makeResponseText';

const server = http.createServer();
const debug = (process.env.NODE_ENV === 'production') ? false : true;

server.on('request', async (req, res) => {
	res.setStatus = 200;
	if (debug) {
		res.setHeader('Content-Type', 'text/html');
		const clientReloadScriptMaker = require('../scripts/build-client-reload-script');
		await clientReloadScriptMaker.buildHtmlScript()
		.then((clientReloadScript: string) => {
			res.end(`
				${ clientReloadScript }
				${ makeResponseText() }
		 	`);
		});
	} else {
		res.setHeader('Content-Type', 'text/plain');
		res.end(makeResponseText());
	}
}).listen(6766, () => {
	console.log(`Server is running on 6766! ${new Date()}`);
});