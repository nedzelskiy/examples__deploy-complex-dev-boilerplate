const fs = require('fs');
let file = fs
    .readFileSync('./node_modules/concurrently/src/main.js', 'utf-8')
    .replace('main();' , '')
    .replace('#!/usr/bin/', '//');
fs.writeFileSync('./test2.js', file);
eval(file);

handleClose = function (streams, children, childrenInfo) {
    var aliveChildren = _.clone(children);
    var exitCodes = [];
    var closeStreams = _.map(streams, 'close');
    var closeStream = Rx.Observable.merge.apply(this, closeStreams);
    var othersKilled = false;

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

        if (nonSuccess && config.allowRestart && childInfo.restartTries--) {
            respawnChild(event, childrenInfo);
            return;
        }

        if (aliveChildren.length === 0) {
            exit(exitCodes);
        }
        if (!othersKilled) {
            if (config.killOthers) {
                killOtherProcesses(aliveChildren);
                othersKilled = true;
            } else if (config.killOthersOnFail && nonSuccess) {
                killOtherProcesses(aliveChildren);
                othersKilled = true;
            }
        }
    });
};
config.allowRestart = false;
config.prefix = "[{index}]-pid:[{pid}]";
run([
    "node microservices/server-app-restarter.js"
]);
