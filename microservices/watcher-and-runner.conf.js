'use strict';
/*
 * This is a config file for watcher and runner microservice built on fs-watcher lib
 * Here you can define folders and files that will be watched and define a callbacks
 * that will be run if in those folders or files change smth
 *
 * Example structure for options
 *
    options[<serve url>] = {
        callbacks: {
            create: () => {},
            change: () => {},
            delete: () => {},
            any: () => {}   // optionally -> if exists that previous will be ignored
        },
        runImmediately: () => {},       // optionally task will be run Immediately
        includeDir: (fullNamePath) => {},   // optionally
        includeFile: (fullNamePath) => {}   // optionally
    };
 *
 * You can build this file with any rules and also without process env variables
*/

const path = require('path');
const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');

const CONSTANTS = {
    SERVER__SRC_FOLDER:          process.env.SERVER__SRC_FOLDER,
    SERVER__BUILD_FOLDER:        process.env.SERVER__BUILD_FOLDER,
    SERVER__SRC_TEST_FOLDER:     process.env.SERVER__SRC_TEST_FOLDER
};

CONSTANTS.SERVER__SRC_FOLDER = path.normalize(CONSTANTS.SERVER__SRC_FOLDER);
CONSTANTS.SERVER__BUILD_FOLDER = path.normalize(CONSTANTS.SERVER__BUILD_FOLDER);
CONSTANTS.SERVER__SRC_TEST_FOLDER = path.normalize(CONSTANTS.SERVER__SRC_TEST_FOLDER);

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.log(`${FILENAME}: You must set ${key} env!`);
        process.exit(1);
    }
}

const options =  {};
const fs = require('fs');
const fse = require('fs-extra');
const exec = require('child_process').exec;
const recursive = require("recursive-readdir");

const deniedFilesToCopyFromServerSrcToBuild = [
    'ts',
    'tsx'
];

const copyAllFileFromServerToBuild = () => {
    return new Promise((resolve, reject) => {
        recursive(
            CONSTANTS.SERVER__SRC_FOLDER,
            [
                (fileName, stats) => {
                    let ext = fileName.split('.').pop();
                    return !stats.isDirectory() && deniedFilesToCopyFromServerSrcToBuild.reduce((bool, extension) => {
                            return extension === ext ? !!(++bool) : !!bool
                        }, false);
                }
            ],
            (err, files) => {
                if (err) {
                    reject(err);
                    return false;
                }
                files.forEach(fileName => {
                    fse.outputFileSync(fileName.replace(CONSTANTS.SERVER__SRC_FOLDER, CONSTANTS.SERVER__BUILD_FOLDER), fs.readFileSync(fileName, 'utf-8'));
                });
                resolve(files);
            }
        );
    });
};

const copyFileFromServerToBuild = (fullNamePath) => {
    let ext = fullNamePath.split('.').pop();
    fse.outputFileSync(fullNamePath.replace(CONSTANTS.SERVER__SRC_FOLDER, CONSTANTS.SERVER__BUILD_FOLDER), fs.readFileSync(fullNamePath, 'utf-8'));
    return Promise.resolve([fullNamePath]);
};

const copyServerFilesFromSrcToBuild = (fullNamePath) => {
    let promise_ = (fullNamePath) ? copyFileFromServerToBuild(fullNamePath) : copyAllFileFromServerToBuild();
    promise_
    .then((files)=> {
        console.log(`${FILENAME}: static files copied! ${files.toString()}`);
        exec(`node scripts/request-refresh-browser-script.js`, (error, stdout, stderr) => {
            if (error) {
                console.log(`${FILENAME}: Error! ${error}`, stdout, stderr);
            }
        });
    });
};

const deleteFilesInBuildServerFolder = (fullNamePath) => {
    fse.remove(fullNamePath.replace(CONSTANTS.SERVER__SRC_FOLDER, CONSTANTS.SERVER__BUILD_FOLDER)).then(() => {
        console.log(`${FILENAME}: files deleted! ${fullNamePath.toString()}`);
    });
};

options[CONSTANTS.SERVER__SRC_FOLDER] = {
    callbacks: {
        create: copyServerFilesFromSrcToBuild,
        change: copyServerFilesFromSrcToBuild,
        delete: deleteFilesInBuildServerFolder
    },
    runImmediately: copyServerFilesFromSrcToBuild,
    includeFile: function(fullNamePath) {
        return !/\.tsx?/.test(fullNamePath);
    }
};
options[CONSTANTS.SERVER__SRC_TEST_FOLDER] = {
    callbacks: {
        any: function(fullNamePath) {
            console.log(`${FILENAME}: Change detected with ${fullNamePath}`);
            console.log(`${FILENAME}: run build server script...`);
            exec(`node scripts/build-server-script.js`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`${FILENAME} ERROR:  ${error}`);
                } else {
                    console.log(`${FILENAME}: ${stdout}`, stderr);
                }
            });
        }
    },
    includeFile: function(fullNamePath) {
        return /[sS]pec\.[a-zA-Z]+$/.test(fullNamePath);
    }
};

module.exports = options;