#!/bin/bash
eval `grep "^export " ./sh/env.sh` && \
node microservices/server-app-restarter.js