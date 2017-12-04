#!/bin/bash
eval `grep "^export " ./sh/env.sh` && \
find ${SERVER__BUILD_FOLDER}/*  | xargs rm -rf