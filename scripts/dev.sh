#!/bin/bash
export \
SAR_BOOTSTRAP='build/server.js' \
SAR_PORT=6601 \
SBR_PORT=6602 \
SERVER_BUILD_FOLDER='build' \
SERVER_SRC_FOLDER='src/server' \
URL_APP_RELOAD_SERVER='http://localhost:6601' \
URL_BROWSER_RELOAD_SERVER='http://localhost:6602' \
&& \
node node_modules/concurrently/src/main.js  \
"node node_modules/webpack/bin/webpack.js --config ./configs/webpack-client.conf.js" \
"node microservices/server-app-restarter.js" \
"node microservices/server-static-watcher.js" \
"node microservices/server-browser-restarter.js" \
"node node_modules/tsc-watch/tsc-watch.js -p configs/tsconfig-server.json --onSuccess \"node ./scripts/build-server-script.js\""