const terminate = require('terminate'); // kill process with child process!

const exitWithNonZeroCode = () => {
    terminate(process.pid, err => {
        if (err) {
            console.log(err);
        }
    });
};

process.on('uncaughtException', (err) => {
    console.log('========== uncaughtException =============');
    console.log(err);
    console.log('==========================================');
    setTimeout(exitWithNonZeroCode, 100);
});

const EventEmitter = require('events');


const fs = require('fs');
const parse = require('shell-quote').parse;
const exec = require('child_process').exec;
const argv = require('minimist')(process.argv.slice(2));

let file = fs
    .readFileSync('./node_modules/concurrently/src/main.js', 'utf-8')
    .replace('main();' , '')
    .replace('#!/usr/bin/', '//');
eval(file);

let maxIndex = 0;
let childrenInfoKeeper = {};

// override run func from concurrently
run = function (commands /* added */, oldIndex) {
    var childrenInfo = {};
    var lastPrefixColor = _.get(chalk, chalk.gray.dim);
    var prefixColors = config.prefixColors.split(',');
    var names = config.names.split(config.nameSeparator);
    var children = _.map(commands, function(cmd, index) {
        // Remove quotes.
        cmd = stripCmdQuotes(cmd);

        var spawnOpts = config.raw ? {stdio: 'inherit'} : {};
        if (IS_WINDOWS) {
            spawnOpts.detached = false;
        }
        if (supportsColor) {
            spawnOpts.env = Object.assign({FORCE_COLOR: supportsColor.level}, process.env)
        }

        var child = spawnChild(cmd, spawnOpts);
        if (index < prefixColors.length) {
            var prefixColorPath = prefixColors[index];
            lastPrefixColor = _.get(chalk, prefixColorPath, chalk.gray.dim);
        }

        var name = index < names.length ? names[index] : '';
        childrenInfo[child.pid] = {
            command: cmd,
            index: /* added */ oldIndex ? oldIndex: index,
            name: name,
            options: spawnOpts,
            restartTries: config.restartTries,
            prefixColor: lastPrefixColor
        };
        // ===================================== ADDED ============================
        childrenInfoKeeper[child.pid] = {
            command: cmd,
            index: oldIndex ? oldIndex: index,
            name: name,
            options: spawnOpts,
            restartTries: config.restartTries,
            prefixColor: lastPrefixColor
        };
        if (childrenInfoKeeper[child.pid].index * 1 !== maxIndex) {
            maxIndex = childrenInfoKeeper[child.pid].index * 1;
        }
        if (!global.cPids)  global.cPids = {};
        global.cPids[cmd] = {
            pid: child.pid,
            index: childrenInfoKeeper[child.pid].index,
            name: name
        };
        // ===================================== FINISH ADDED ============================
        return child;
    });

    var streams = toStreams(children);

    handleChildEvents(streams, children, childrenInfo);
    // ================= DELETED OTHER CODE FROM HERE ============================
};

// override handleClose func from concurrently
handleClose = function(streams, children, childrenInfo) {
    // deleted var aliveChildren = _.clone(children);
    var exitCodes = [];
    var closeStreams = _.map(streams, 'close');
    var closeStream = Rx.Observable.merge.apply(this, closeStreams);

    // deleted var othersKilled = false;

    closeStream.subscribe(function(event) {
        var exitCode = event.data;
        // deleted var nonSuccess = exitCode !== 0;
        exitCodes.push(exitCode);

        var prefix = getPrefix(childrenInfo, event.child);
        var childInfo = childrenInfo[event.child.pid];
        var prefixColor = childInfo.prefixColor;
        var command = childInfo.command;
        logEvent(prefix, prefixColor, command + ' exited with code ' + exitCode);

        // ================= DELETED OTHER CODE FROM HERE ============================
    });
};


const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');

config.allowRestart = false;
config.killOthers = false;
config.restartAfter = 0;
config.prefix = "[{index}]-pid:[{pid}]";
run(argv['_']);

const exitWithZeroCode = () => {
    let promises = [];
    for (let pid in childrenInfoKeeper) {
        if (!childrenInfoKeeper.hasOwnProperty(pid)) continue;
        promises.push(new Promise((resolve, reject) => {
            terminate(pid, 'SIGTERM', err => {
                resolve();
            });
        }));
    }
    Promise.all(promises).then(() => {
        process.exit(0);
    }).catch(err => {
        console.log(err);
        setTimeout(exitWithNonZeroCode, 100);
    });
};

const availableCommands = {
    'r': {
        run: function(pid) {
            if (!pid || !/^\d+$/.test(pid)) {
                console.log(`Wrong argument pid for command r - restart by pid, type "help" command`);
                return false;
            }
            terminate(pid, err => {
                if (err) {
                    console.log(err);
                } else {
                    if (
                           'undefined' !== typeof childrenInfoKeeper
                        && 'undefined' !== typeof childrenInfoKeeper[pid]
                        && 'undefined' !== typeof childrenInfoKeeper[pid].index
                        && 'undefined' !== typeof childrenInfoKeeper[pid].command
                    ) {
                        run([childrenInfoKeeper[pid].command], childrenInfoKeeper[pid].index);
                    } else {
                        console.log(`Can't restart command by pid "${pid}", maybe this process already died!`);
                        if ('undefined' !== typeof childrenInfoKeeper[pid]) {
                            delete childrenInfoKeeper[pid];
                        }
                    }
                }
            });
        },
        usage: 'r [PID] <> restart concurrently task by pid'
    },
    'add': {
        run: (command, index) => {
            let newIndex = index || ++maxIndex;
            run([command], newIndex);
        },
        usage: 'add [command, [index]] <> add a new command to concurrently spawn'
    },
    'list': {
        run: () => {
            console.log(`\r\n\r\n ${ JSON.stringify(global.cPids, null, 4)}\r\n`);
        },
        usage: 'list <> show list of all pids of running process'
    },
    'exit': {
        run: exitWithZeroCode,
        usage: 'exit <> stop watching for commands and exit script'
    }
};


const execConsole = require('js_console_command_executor')(availableCommands);

execConsole.actions.doExit = exitWithZeroCode;
execConsole();

// global.globalEmitter.on('add-command', ({ cmd, index }) => {
//     execConsole.commands.add(cmd, index);
// });
