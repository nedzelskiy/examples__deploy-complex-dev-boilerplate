'use strict';

const fs = require('fs-extra');
const URL_BROWSER_RELOAD_SERVER = process.env.URL_BROWSER_RELOAD_SERVER || 'http://localhost:8802';

const buildHtmlScript = async () => {
    const libClient = await fs.readFile('./node_modules/socket.io-client/dist/socket.io.js', 'utf-8');
    const clientReloadCode = await fs.readFile('./scripts/client-browser-restarter-script.js', 'utf-8');
    return Promise.resolve(`
			<script>${ libClient }</script> 
			<script>${ clientReloadCode.replace("[serverUrl]", URL_BROWSER_RELOAD_SERVER) }</script>
        `);
};

module.exports = { buildHtmlScript };