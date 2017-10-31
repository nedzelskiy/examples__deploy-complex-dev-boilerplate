#!/bin/bash
env.sh && \
node node_modules/concurrently/src/main.js  \
"node microservices/server-static-watcher.js" \
"node microservices/server-app-restarter.js" \
"node microservices/server-browser-restarter.js" \
"node node_modules/tsc-watch/tsc-watch.js -p configs/tsconfig-server.json --onSuccess \"node ./scripts/build-server-script.js\""