'use strict';

const SERVER__PORT: string = (process.env as any).SERVER__PORT || (process.env as any).PORT || 80;
const SERVER__URL: string = (process.env as any).SERVER__URL || `http://localhost:${SERVER__PORT}`;

import * as http from 'http';
import handleHttp from './handleHttp';

const server = http.createServer();
const DEBUG = ((process.env as any).NODE_ENV === 'production') ? false : true;

server.on('request', handleHttp).listen(SERVER__PORT, () => {
    console.log(`Server is running on ${SERVER__URL} ${new Date()}`);
});