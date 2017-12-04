#!/bin/bash
eval `grep "^export " ./sh/env.sh` && \
node ./scripts/run-server-tests.js