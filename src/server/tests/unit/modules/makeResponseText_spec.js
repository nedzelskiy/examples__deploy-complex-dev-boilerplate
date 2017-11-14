'use strict';

const path = require('path');
const expect = require('chai').expect;
const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');
const moduleWay = path.normalize(`${process.env.PWD}/${process.env.SERVER__BUILD_FOLDER}/modules/makeResponseText`);

let makeResponseText = null;
try {
    makeResponseText = require(moduleWay);
} catch (err) {
    console.log(`Maybe file not compiled yet! Can not resolve ${moduleWay}`);
    process.exit(0);
}

const strResponse = 'Server render: It works!';

describe(`${FILENAME}`, () => {
    it(`should return text "${strResponse}"`, next => {
        expect(makeResponseText.default()).to.be.equal(strResponse);
        next();
    })
});