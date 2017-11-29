#!/bin/bash
eval `grep "^export " ./sh/env.sh` && \
node ./scripts/make-client-configs.js && \
node node_modules/webpack/bin/webpack.js --config ${CONFIGS_SERVICES__DIR}/webpack-client.conf.js