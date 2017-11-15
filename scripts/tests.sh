#!/bin/bash
eval `grep "^export " ./scripts/env.sh` && \
node scripts/run-server-tests.js