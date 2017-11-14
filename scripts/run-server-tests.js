'use strict';
const path = require('path');
const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');

const CONSTANTS = {
    SERVER__SRC_TEST_FOLDER: process.env.SERVER__SRC_TEST_FOLDER
};

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.log(`${FILENAME}: You must set ${key} env!`);
        process.exit(1);
    }
}

const Jasmine = require('jasmine');
const jasmine = new Jasmine();

const spec_dir = path.normalize(`/${CONSTANTS.SERVER__SRC_TEST_FOLDER}/`);
const spec_files = [
    '**/*_[sS]pec.js'
];

jasmine.loadConfig({
    spec_dir: spec_dir,
    spec_files: spec_files
});
console.log("\r\n\r\nStarting server tests!!! \r\n");
jasmine.execute();