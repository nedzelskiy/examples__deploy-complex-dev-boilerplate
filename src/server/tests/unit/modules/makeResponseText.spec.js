'use strict';

const path = require('path');
const expect = require('chai').expect;

const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');
const makeResponseText = require(path.normalize(`${process.env.PWD}/${process.env.SERVER__BUILD_FOLDER}/modules/makeResponseText`));

const strResponse = 'Server render: It works!';

describe(`${FILENAME}`, () => {
    it(`should return text "${strResponse}"`, next => {
        expect(makeResponseText.default()).to.be.equal(strResponse);
        next();
    })
});