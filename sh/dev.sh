#!/bin/bash
eval `grep "^export " ./sh/env.sh` && \
node ./scripts/concurrently-wrapper.js \
"sh ./sh/webpack-client.sh" \
"sh ./sh/server-app-restarter.sh" \
"sh ./sh/watcher-and-runner.sh" \
"sh ./sh/server-browser-restarter.sh" \
"sh ./sh/server-livereload-proxy.sh" \
"sh ./sh/ts-server.sh"