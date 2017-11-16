'use strict';

const path = require('path');
const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');

const CONSTANTS = {
    WATCHER_AND_RUNNER__PORT:           process.env.WATCHER_AND_RUNNER__PORT,
    WATCHER_AND_RUNNER__COLOR:          process.env.WATCHER_AND_RUNNER__COLOR || 'gray',
    WATCHER_AND_RUNNER__WAY_TO_CONFIG:  process.env.WATCHER_AND_RUNNER__WAY_TO_CONFIG
};

for (let key in CONSTANTS) {
    if (!CONSTANTS[key]) {
        console.log(`${FILENAME}: You must set ${key} env!`);
        process.exit(1);
    }
}

const ctx = {
    'name': FILENAME,
    'color': CONSTANTS.WATCHER_AND_RUNNER__COLOR,
    'port': CONSTANTS.WATCHER_AND_RUNNER__PORT,
    'process': process
};

let config = null;
const Watcher = require('watch-fs').Watcher;
const util = require('./microservices-utils');
const sendConsoleText = util.sendConsoleText.bind(ctx);

try {
    config = require(`../${CONSTANTS.WATCHER_AND_RUNNER__WAY_TO_CONFIG}`);
} catch(err) {
    sendConsoleText(`Some problems with microservice configuration file! ${err}`, 'err');
    process.exit(1);
}

let immediatelyTasks = [];
try {
    for (let url in config) {
        let watcherOptions = {
            paths: [url],
            filters: {}
        };
        if (config[url].includeDir && typeof config[url].includeDir === 'function') {
            watcherOptions.filters.includeDir = config[url].includeDir;
        }
        if (config[url].includeFile && typeof config[url].includeFile === 'function') {
            watcherOptions.filters.includeFile = config[url].includeFile;
        }
        let watcher = new Watcher(watcherOptions);
        if (config[url].runImmediately && typeof config[url].runImmediately === 'function') {
            immediatelyTasks.push(config[url].runImmediately);
        }
        if (config[url].callbacks.any && typeof config[url].callbacks.any === 'function') {
            watcher.on('any', fullNamePath => {
                config[url].callbacks.any(fullNamePath);
            });
        } else {
            if (!config[url].callbacks.create || typeof config[url].callbacks.create !== 'function' ) {
                throw new Error(`You must define callback for "create" action`);
            }
            if (!config[url].callbacks.change || typeof config[url].callbacks.change !== 'function' ) {
                throw new Error(`You must define callback for "change" action`);
            }
            if (!config[url].callbacks.delete || typeof config[url].callbacks.delete !== 'function' ) {
                throw new Error(`You must define callback for "delete" action`);
            }
            watcher.on('create', fullNamePath => {
                config[url].callbacks.create(fullNamePath);
            });
            watcher.on('change', fullNamePath => {
                config[url].callbacks.change(fullNamePath);
            });
            watcher.on('delete', fullNamePath => {
                config[url].callbacks.delete(fullNamePath);
            });
        }
        watcher.start((err, failed) => {});
    }
    immediatelyTasks.forEach(task => {
        if (typeof task === 'function') {
            task();
        }
    });
    sendConsoleText(`started on ${CONSTANTS.WATCHER_AND_RUNNER__PORT}`);
} catch(err) {
    sendConsoleText(err, 'err');
}


