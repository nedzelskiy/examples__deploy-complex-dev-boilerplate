'use strict';

import * as fs from 'fs';
import * as ejs from 'ejs';
import * as mime from 'mime';
import * as path from 'path';
import * as md5File from 'md5-file';
import makeResponseText from './modules/makeResponseText';

const handleHttp = (req: any, res: any) => {
    res.setStatus = 200;
    res.statusCode = 200;
    if ('/' !== req.url) {
        try {
            let file = fs.readFileSync(`${ path.normalize (__dirname + req.url.split('?')[0]) }`)
                ,mimeType = mime.getType(`${ path.normalize (__dirname + req.url.split('?')[0]) }`)
                ;
            res.setHeader('Content-Type', mimeType);
            res.end(file);
        } catch (err) {
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
    } catch(err) {
        console.log(`SERVER ERROR: Can\'t find ${ fileName } for md5 hash!`);
    }

    let html = ejs.render(fs.readFileSync(__dirname + '/index.ejs', 'utf-8').toString(), {
        serverRenderText: makeResponseText(),
        title: 'Welcome to boilerplate',
        cssClientHash: cssClientHash || 0,
        jsClientHash: jsClientHash || 0,
        cssServerHash: cssServerHash || 0,
        jsServerHash: jsServerHash || 0
    });
    res.end(html);
};

export default handleHttp;