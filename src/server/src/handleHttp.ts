'use strict';

import * as fs from 'fs';
import * as ejs from 'ejs';
import * as mime from 'mime';
import * as path from 'path';
import makeResponseText from './modules/makeResponseText';

const handleHttp = (req: any, res: any) => {
    res.setStatus = 200;
    if ('/' !== req.url) {
        try {
            let file = fs.readFileSync(`${ path.normalize (__dirname + req.url) }`)
                ,mimeType = mime.getType(`${ path.normalize (__dirname + req.url) }`)
                ;
            res.setHeader('Content-Type', mimeType);
            res.end(file);
        } catch (err) {
            res.setStatus = 404;
            res.end('Not found!');
        }
        return;
    }
    res.setHeader('Content-Type', 'text/html');
    let html = ejs.render(fs.readFileSync(__dirname + '/index.ejs', 'utf-8').toString(), {
        serverRenderText: makeResponseText(),
        title: 'Welcome to boilerplate'
    });
    res.end(html);
};

export default handleHttp;