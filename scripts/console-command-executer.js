'use strict';

const path = require('path');
const stdin = process.openStdin();
const terminate = require('terminate');
const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');
const ps = require('ps-node');
const exec = require('child_process').exec;

const restartProcessByPid = (pid, commandLine) => {
    ps.lookup({ pid: pid }, (err, resultList ) => {
        if (err) {
            console.error(`${FILENAME} ERROR: ${err}`);
        }
        const process = resultList[0];
        if( process ) {
            console.log(process.env);
            killProcessWithChild(pid)
                .then(() => {
                    console.log(`${FILENAME}: Command ${commandLine} was executed successful!`);
                    exec(`"${process.command}" ${process.arguments.join(' ')}`, function callback(error, stdout, stderr){
                        if (error) {
                            console.error(`${FILENAME} ERROR: ${error}`);
                        } else {
                            console.log(stdout);
                        }
                    });
                })
                .catch(err => {
                    console.error(`${FILENAME} ERROR: ${err}`);
                });
        } else {
            console.log( 'No such process found!' );
        }
    });
};

const killProcessWithChild = (pid) => {
    return new Promise((resolve, reject) => {
        terminate(pid, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const availableCommands = {
    'kill': 'kill',
    'help': 'help',
    'restart': 'restart'
};

stdin.addListener("data", (d) => {
    const commandLine = d.toString().trim().replace(/[\t\s]+/,' ');
    const commandChunks = commandLine.split(' ');
    const command = commandChunks[0];
    switch (command) {
        case availableCommands.kill:
            if (commandChunks.length > 1 && /^\d+$/.test(commandChunks[1])) {
                killProcessWithChild(commandChunks[1])
                    .then(() => {
                        console.log(`${FILENAME}: Command ${commandLine} was executed successful!`);
                    })
                    .catch(err => {
                        console.error(`${FILENAME} ERROR: ${err}`);
                    });
            } else {
                console.error(`${FILENAME}: Wrong argument for command ${command}`)
            }
            break;
        case availableCommands.help:
            console.log(`${FILENAME}: Available commands are: ${Object.keys(availableCommands).toString()}`);
            break;
        case availableCommands.restart:
            if (commandChunks.length > 1 && /^\d+$/.test(commandChunks[1])) {
                restartProcessByPid(commandChunks[1], commandLine);
            } else {
                console.error(`${FILENAME}: Wrong argument for command ${command}`)
            }
            break;
        default:
            console.error(`${FILENAME}: Command not recognized! Use help command!`);

    }
});

console.log(`${FILENAME}: watching for commands!`);
console.log(`${FILENAME}: type help for list of commands!`);

