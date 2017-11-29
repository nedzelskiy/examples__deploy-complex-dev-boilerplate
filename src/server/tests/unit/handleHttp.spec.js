'use strict';

const path = require('path');
const request = require('request');
const mock = require('mock-require');
const assert = require('chai').assert;
const expect = require('chai').expect;

mock('fs', {
    readFileSync: (str) => {
        if (!!~str.indexOf('file.404')) {
            throw new Error();
        }
        return str;
    }
});
mock('mime', {
    getType: (str) => {
        return str;
    }
});

const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');
const handleHttp = require(path.normalize(`${process.env.PWD}/${process.env.SERVER__BUILD_FOLDER}/handleHttp`))['default'];

const mockRes = {
    body: '',
    setHeader: (key, value) => {
        mockRes.setHeader[key] = value;
    },
    setStatus: 200,
    end: (str) => {
        mockRes.body = str.replace(/[\s\t\r\n]+/, ' ');
    }
};

describe(`${FILENAME}`, () => {
    beforeEach(() => {
        mockRes.body = '';
    });

    it(`should give index.ejs on url "/"`, next => {
        handleHttp({
            url: '/'
        }, mockRes);
        expect(mockRes.setStatus).to.be.equal(200);
        assert.isTrue(!!~mockRes.body.indexOf('index.ejs'));
        next();
    });
    it(`should give file if request not on "/"`, next => {
        handleHttp({
            url: '/file.test'
        }, mockRes);
        assert.isTrue(!!~mockRes.body.indexOf('file.test'));
        next();
    });
    it(`should return 404 if file not found` , next => {
        handleHttp({
            url: '/file.404'
        }, mockRes);
        expect(mockRes.setStatus).to.be.equal(404);
        expect(mockRes.body).to.be.equal('Not found!');
        next();
    });
});