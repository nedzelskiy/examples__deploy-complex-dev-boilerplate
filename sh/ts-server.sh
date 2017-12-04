#!/bin/bash
eval `grep "^export " ./sh/env.sh` && \
node ./scripts/make-server-configs.js && \
node node_modules/typescript/bin/tsc -p ${CONFIGS_SERVICES__DIR}/tsconfig-server.json