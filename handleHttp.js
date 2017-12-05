'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const ejs = require("ejs");
const mime = require("mime");
const path = require("path");
const md5File = require("md5-file");
const makeResponseText_1 = require("./modules/makeResponseText");
const handleHttp = (req, res) => {
    res.setStatus = 200;
    res.statusCode = 200;
    if ('/' !== req.url) {
        try {
            let file = fs.readFileSync(`${path.normalize(__dirname + req.url.split('?')[0])}`), mimeType = mime.getType(`${path.normalize(__dirname + req.url.split('?')[0])}`);
            res.setHeader('Content-Type', mimeType);
            res.end(file);
        }
        catch (err) {
            res.setStatus = 404;
            res.statusCode = 404;
            res.end('Not found!');
        }
        return;
    }
    res.setHeader('Content-Type', 'text/html');
    let cssClientHash, jsClientHash, cssServerHash, jsServerHash, fileName, hash;
    try {
        fileName = 'client-bundle.min.css';
        hash = md5File.sync(path.normalize(__dirname + `/client/${fileName}`));
        cssClientHash = hash;
        fileName = 'client-bundle.min.js';
        hash = md5File.sync(path.normalize(__dirname + `/client/${fileName}`));
        jsClientHash = hash;
        fileName = 'server-styles.min.css';
        hash = md5File.sync(path.normalize(__dirname + `/assets/${fileName}`));
        cssServerHash = hash;
        fileName = 'server-js.min.js';
        hash = md5File.sync(path.normalize(__dirname + `/assets/${fileName}`));
        jsServerHash = hash;
    }
    catch (err) {
        console.log(`SERVER ERROR: Can\'t find ${fileName} for md5 hash!`);
    }
    let html = ejs.render(fs.readFileSync(path.normalize(__dirname + '/index.ejs'), 'utf-8').toString(), {
        serverRenderText: makeResponseText_1.default(),
        title: 'Welcome to boilerplate',
        cssClientHash: cssClientHash,
        jsClientHash: jsClientHash,
        cssServerHash: cssServerHash,
        jsServerHash: jsServerHash
    });
    res.end(html);
};
exports.default = handleHttp;
//# sourceMappingURL=handleHttp.js.map