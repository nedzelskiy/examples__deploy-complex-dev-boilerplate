'use strict';

const fs = require('fs');
const URL_BROWSER_RELOAD_SERVER = process.env.URL_BROWSER_RELOAD_SERVER || 'http://localhost:8802';

const buildHtmlScript = () => {
    const libClient = fs.readFileSync('./node_modules/socket.io-client/dist/socket.io.js', 'utf-8');
    const clientReloadCode = fs.readFileSync('./scripts/client-browser-restarter-script.js', 'utf-8');
    return (`
        <script>${ libClient }</script> 
        <script>${ clientReloadCode.replace("[serverUrl]", URL_BROWSER_RELOAD_SERVER) }</script>
    `);
};

module.exports = { buildHtmlScript };