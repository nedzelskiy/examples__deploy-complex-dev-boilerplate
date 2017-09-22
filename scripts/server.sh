#!/bin/bash
node microservices/server-restarter.js & \
node microservices/server-browser-restarter.js & \
node node_modules/tsc-watch/tsc-watch.js -p configs/tsconfig-server.json \
--onSuccess "node ./scripts/build-script.js"