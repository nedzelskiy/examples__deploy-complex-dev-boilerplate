'use strict';

const CONSTANTS = {
    PORT:                       process.env.PROXY_SERVER_PORT,
    COLOR:                      process.env.SBR_COLOR || 'magentaBright',
    SERVER_PORT:                process.env.SERVER_PORT,
    SERVER_DOMAIN_NAME:         process.env.SERVER_DOMAIN_NAME,
    URL_BROWSER_RELOAD_SERVER:  process.env.URL_BROWSER_RELOAD_SERVER
};

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.error(`Build client script: You must set ${key} env!`);
        process.exit(1);
        return false;
    }
}

const util = require('./microservices-utils');
const NAME = 'server-livereload-proxy';

const ctx = {
    'name': NAME,
    'color': CONSTANTS.COLOR,
    'port': CONSTANTS.PORT,
    'types': {}
};
const sendConsoleText = util.sendConsoleText.bind(ctx);

const http = require('http');
const request = require('request');
const fs = require('fs');

const buildHtmlScript = () => {
    const libClient = fs.readFileSync('./node_modules/socket.io-client/dist/socket.io.js', 'utf-8');
    const clientReloadCode = fs.readFileSync('./scripts/client-browser-restarter-script.js', 'utf-8');
    return (`
        <script>${ libClient }</script> 
        <script>${ clientReloadCode.replace("[serverUrl]", CONSTANTS.URL_BROWSER_RELOAD_SERVER) }</script>
    `);
};

http.createServer(function(req, res) {
    request(
        {
            uri: `http://${CONSTANTS.SERVER_DOMAIN_NAME}:${CONSTANTS.SERVER_PORT}${req.url}`,
            proxy: ''
        },
        (error, response, body) => {
            if (error) {
                sendConsoleText(error, 'error');
                process.exit(1);
                return false;
            }
            if (response && response.headers) {
                for (let key in response.headers) {
                    if (key === 'content-length' || key === 'connection') continue;
                    res.setHeader(key, response.headers[key]);
                }
            }
            if (response && response.statusCode) {
                res.statusCode = response.statusCode;
            }
            if (!!~body.indexOf('<html')) {
                body = body + buildHtmlScript();
            }
            res.setHeader('content-length', body.length);
            res.end(body);
        }
    );
}).listen(CONSTANTS.PORT, () => {
    sendConsoleText(`Server is running on http://localhost:${CONSTANTS.PORT}! ${new Date()}`);
});