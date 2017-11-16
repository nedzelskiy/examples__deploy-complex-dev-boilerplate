#!/bin/bash
eval `grep "^export " ./scripts/env.sh` && \
node ./scripts/make-configs.js && \
node ./scripts/concurrently-wrapper.js \
"node node_modules/webpack/bin/webpack.js --config ${CONFIGS_SERVICES__DIR}/webpack-client.conf.js" \
"node microservices/server-app-restarter.js" \
"node microservices/watcher-and-runner.js" \
"node microservices/server-browser-restarter.js" \
"node microservices/server-livereload-proxy.js" \
"node node_modules/tsc-watch/tsc-watch.js -p ${CONFIGS_SERVICES__DIR}/tsconfig-server.json --onSuccess \"node ./scripts/build-server-script.js\""