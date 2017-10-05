#!/bin/bash
export \
SAR_BOOTSTRAP='build/server.js' \
SAR_PORT=6601 \
SBR_PORT=6602 \
URL_APP_RELOAD_SERVER='http://localhost:6601' \
URL_BROWSER_RELOAD_SERVER='http://localhost:6602' \
&& \
node_modules/concurrently/src/main.js  \
"node microservices/server-app-restarter.js" \
"node microservices/server-browser-restarter.js" \
"node node_modules/tsc-watch/tsc-watch.js -p configs/tsconfig-server.json --onSuccess 'node ./scripts/build-app-script.js'"