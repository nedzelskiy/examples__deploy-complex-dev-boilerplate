'use strict';

import * as http from 'http';
import * as fs from 'fs-extra';
import makeResponseText from './modules/makeResponseText';

const server = http.createServer();
const debug = true;

server.on('request', async (req, res) => {
	res.setStatus = 200;
	res.setHeader('Content-Type', 'text/html');
	debug && res.end('<script>' + await fs.readFile('./scripts/websocket-client-reload.js') + '</script>' + makeResponseText()); 
	!debug && res.end(makeResponseText()); 
}).listen(6766, () => {
	console.log('Server is running on 6766!'); 
});
