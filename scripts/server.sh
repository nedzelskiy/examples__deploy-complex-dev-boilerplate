#!/bin/bash
SAR_PORT=6601 \
URL_BROWSER_RELOAD_SERVER='http://localhost:6602' \
node microservices/server-app-restarter.js & \
 \
SBR_PORT=6602 \
node microservices/server-browser-restarter.js & \
 \
URL_APP_RELOAD_SERVER='http://localhost:6601' \
URL_BROWSER_RELOAD_SERVER='http://localhost:6602' \
node node_modules/tsc-watch/tsc-watch.js -p configs/tsconfig-server.json \
--onSuccess \
"node ./scripts/build-app-script.js"