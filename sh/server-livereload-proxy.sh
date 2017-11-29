#!/bin/bash
eval `grep "^export " ./sh/env.sh` && \
node microservices/server-livereload-proxy.js