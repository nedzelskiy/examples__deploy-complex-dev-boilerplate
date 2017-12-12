'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const ejs = require("ejs");
const mime = require("mime");
const path = require("path");
const md5File = require("md5-file");
const makeResponseText_1 = require("./modules/makeResponseText");
const handleHttp = (req, res) => {
    res.statusCode = 200;
    if ('/' !== req.url && typeof req.url !== 'undefined') {
        try {
            let url = req.url.toString().split('?')[0], file = fs.readFileSync(`${path.normalize(__dirname + url)}`), mimeType = mime.getType(`${path.normalize(__dirname + url)}`);
            if (mimeType) {
                res.setHeader('Content-Type', mimeType);
            }
            res.end(file);
        }
        catch (err) {
            res.statusCode = 404;
            res.end('Not found!');
        }
        return;
    }
    res.setHeader('Content-Type', 'text/html');
    let hash = 'undefined', fileName = 'undefined', jsServerHash = 'undefined', jsClientHash = 'undefined', cssClientHash = 'undefined', cssServerHash = 'undefined';
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