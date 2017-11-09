const fs = require('fs');
const terminate = require('terminate');
const parse = require('shell-quote').parse;
const exec = require('child_process').exec;
const argv = require('minimist')(process.argv.slice(2));
var chalk = require('chalk');
var _ = require('lodash');


let file = fs
    .readFileSync('./node_modules/concurrently/src/main.js', 'utf-8')
    .replace('main();' , '')
    .replace('#!/usr/bin/', '//');
eval(file);
const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');

config.allowRestart = true;
config.killOthers = false;
config.prefix = "[{index}]-pid:[{pid}]";
run(argv['_']);

const availableCommands = {
    'r': {
        run: function(pid) {
            if (!pid || !/^\d+$/.test(pid)) {
                console.error(`Wrong argument pid for command r - restart by pid`);
                return false;
            }
            let eventMock = {
                child: {
                    pid: pid
                }
            };
            let childrenInfoMock = {};
            childrenInfoMock[pid] = {
                command: 'node microservices/server-app-restarter.js', // TODO
                index: 0, // TODO
                restartTries: 0,
                prefixColor: _.get(chalk, 'gray.dim', chalk.gray.dim), // TODO
                options: {}
            };
            respawnChild(eventMock, childrenInfoMock);
        }
    },
    'exit': {
        run: function() {
            const signal = 'SIGTERM';
            console.log(`Command exit ${process.pid} will be executed with signal [${signal}]!`);
            terminate(process.pid, 'SIGTERM', err => {
                if (err) {
                    console.error(err);
                }
            });
        }
    }
};
availableCommands.r.usage = 'r [PID] <> restart concurrently task by pid';
availableCommands.exit.usage = 'exit <> stop watching for commands and exit script';
const execConsole = require('js_console_command_executor')(availableCommands);
execConsole();