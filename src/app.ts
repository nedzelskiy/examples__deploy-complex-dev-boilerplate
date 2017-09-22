'use strict';

import * as http from 'http';
import * as fs from 'fs-extra';
import makeResponseText from './modules/makeResponseText';

const server = http.createServer();
const debug = (process.env.NODE_ENV === 'production') ? false : true;

server.on('request', async (req, res) => {
	res.setStatus = 200;
	// TODO with check and implementation socket scripts
	if (debug) {
		const libClient = await fs.readFile('./node_modules/socket.io-client/dist/socket.io.js', 'utf-8');
		const clientReloadCode = await fs.readFile('./microservices/client-browser-restarter.js', 'utf-8');
		res.setHeader('Content-Type', 'text/html');
		res.end(`
			<script>${ libClient }</script> 
			<script>${ clientReloadCode }</script>
			${ makeResponseText() }
		 `);
	} else {
		res.setHeader('Content-Type', 'text/plain');
		res.end(makeResponseText());
	}
}).listen(6766, () => {
	console.log(`Server is running on 6766! ${new Date()}`);
});