'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const SERVER__PORT = process.env.SERVER__PORT || process.env.PORT || 80;
const SERVER__URL = process.env.SERVER__URL || `http://localhost:${SERVER__PORT}`;
const http_1 = require("http");
const handleHttp_1 = require("./handleHttp");
const server = http_1.createServer();
server.on('request', handleHttp_1.default).listen(SERVER__PORT, () => {
    console.log(`Server is running on ${SERVER__URL} ${new Date()}`);
});
//# sourceMappingURL=server.js.map