#!/bin/bash
eval `grep "^export " ./sh/env.sh` && \
node node_modules/istanbul/lib/cli.js cover scripts/run-server-tests.js
