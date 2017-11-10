const fs = require('fs');
const terminate = require('terminate');
const parse = require('shell-quote').parse;
const exec = require('child_process').exec;
const argv = require('minimist')(process.argv.slice(2));

process.on('uncaughtException', (err) => {
    console.log('==================================');
    console.error(err);
    console.log('==================================');
    setTimeout(() => {
        terminate(process.pid, err => {
            if (err) {
                console.error(err);
            }
        });
    }, 200);
});

let file = fs
    .readFileSync('./node_modules/concurrently/src/main.js', 'utf-8')
    .replace('main();' , '')
    .replace('#!/usr/bin/', '//');
eval(file);

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
        // ===================================== FINISH ADDED ============================
        return child;
    });

    var streams = toStreams(children);

    handleChildEvents(streams, children, childrenInfo);

    ['SIGINT', 'SIGTERM'].forEach(function(signal) {
        process.on(signal, function() {
            children.forEach(function(child) {
                treeKill(child.pid, signal);
            });
        });
    });
};

// override handleClose func from concurrently
handleClose = function(streams, children, childrenInfo) {
    var aliveChildren = _.clone(children);
    var exitCodes = [];
    var closeStreams = _.map(streams, 'close');
    var closeStream = Rx.Observable.merge.apply(this, closeStreams);
    var othersKilled = false;

    // TODO: Is it possible that amount of close events !== count of spawned?
    closeStream.subscribe(function(event) {
        var exitCode = event.data;
        var nonSuccess = exitCode !== 0;
        exitCodes.push(exitCode);

        var prefix = getPrefix(childrenInfo, event.child);
        var childInfo = childrenInfo[event.child.pid];
        var prefixColor = childInfo.prefixColor;
        var command = childInfo.command;
        logEvent(prefix, prefixColor, command + ' exited with code ' + exitCode);

        aliveChildren = _.filter(aliveChildren, function(child) {
            return child.pid !== event.child.pid;
        });
        // ================= DELETED OTHER CODE FROM HERE ============================
    });
};


const FILENAME = path.basename(__filename).replace(path.extname(path.basename(__filename)), '');

config.allowRestart = false;
config.killOthers = false;
config.restartAfter = 0;
config.prefix = "[{index}]-pid:[{pid}]";
run(argv['_']);

const saveExit = () => {
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
        console.error(err);
        setTimeout(() => {
            terminate(process.pid, err => {
                if (err) {
                    console.error(err);
                }
            });
        }, 200);
    });
};

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
            let oldIndex = childrenInfoKeeper[pid].index;
            console.log(oldIndex);
            terminate(pid, err => {
                if (err) {
                    console.error(err);
                } else {
                    run([childrenInfoKeeper[pid].command], oldIndex);
                }
            });
        }
    },
    'exit': {
        run: function() {
            saveExit();
        }
    }
};
availableCommands.r.usage = 'r [PID] <> restart concurrently task by pid';
availableCommands.exit.usage = 'exit <> stop watching for commands and exit script';

const execConsole = require('js_console_command_executor')(availableCommands);

execConsole.actions.doExit = () => {
    saveExit();
};
execConsole();

