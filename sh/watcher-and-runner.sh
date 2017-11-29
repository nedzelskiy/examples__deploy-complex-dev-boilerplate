#!/bin/bash
eval `grep "^export " ./sh/env.sh` && \
node microservices/watcher-and-runner.js