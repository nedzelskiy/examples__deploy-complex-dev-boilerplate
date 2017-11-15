#!/bin/bash
eval `grep "^export " ./scripts/env.sh` && \
node node_modules/istanbul/lib/cli.js cover scripts/run-server-tests.js
