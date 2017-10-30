#!/bin/bash
export \
SAR_BOOTSTRAP='build/server.js' \
SAR_PORT=6601 \
SBR_PORT=6602 \
SSW_PORT=6603 \
INDEX_FILE_NAME='index.ejs' \
SERVER_BUILD_FOLDER='build' \
SERVER_SRC_FOLDER='src/server' \
SSW_SUCCESS_CALLBACK='node scripts/request-refresh-browser-script.js' \
URL_APP_RELOAD_SERVER='http://localhost:6601' \
URL_BROWSER_RELOAD_SERVER='http://localhost:6602' \
&& \
node node_modules/concurrently/src/main.js  \
"node microservices/server-static-watcher.js" \
"node microservices/server-app-restarter.js" \
"node microservices/server-browser-restarter.js" \
"node node_modules/tsc-watch/tsc-watch.js -p configs/tsconfig-server.json --onSuccess \"node ./scripts/build-server-script.js\""