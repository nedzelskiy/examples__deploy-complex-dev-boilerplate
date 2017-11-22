'use strict';

const path = require('path');
const request = require('request');
const assert = require('chai').assert;

const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');
const handleHttp = require(path.normalize(`${process.env.PWD}/${process.env.SERVER__BUILD_FOLDER}/handleHttp`))['default'];

const mockRes = {
    body: '',
    setHeader: () => {},
    setStatus: 200,
    end: (str) => {
        mockRes.body = str.replace(/[\s\t\r\n]+/, ' ');
    }
};
const mockReq = {
    url: '/'
};

describe(`${FILENAME}`, () => {

    it(`should give html on url "/"`, next => {
        handleHttp(mockReq, mockRes);
        assert.isTrue(!!~mockRes.body.indexOf('<html'));
        next();
    });
});