'use strict';
const path = require('path');

const Jasmine = require('jasmine');
const jasmine = new Jasmine();
const spec_dir = path.normalize(`/${process.env.SERVER__SRC_TEST_FOLDER}/`);
const spec_files = [
    '**/*[\._][sS]pec.js'
];

jasmine.loadConfig({
    spec_dir: spec_dir,
    spec_files: spec_files
});
console.log("\r\n\r\nStarting server tests!!! \r\n");
jasmine.execute();