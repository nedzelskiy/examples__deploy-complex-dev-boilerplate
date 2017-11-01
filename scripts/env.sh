#!/bin/bash
export SERVER_PORT=6655                                                                                           &&
export SERVER_DOMAIN_NAME='localhost'                                                                             &&
export PROXY_SERVER_PORT=6006                                                                                     &&
export SERVER_APP_RESTARTER__LAUNCH_FILE='build/server.js'                                                        &&
export SERVER_APP_RESTARTER__PORT=6601                                                                            &&
export SERVER_BROWSER_RESTARTER__PORT=6602                                                                        &&
export SERVER_STATIC_WATCHER__PORT=6603                                                                           &&
export SERVER_STATIC_WATCHER__SUCCESS_CALLBACK='node scripts/request-refresh-browser-script.js'                   &&
export SERVER_BUILD_FOLDER='build'                                                                                &&
export INDEX_FILE_NAME='index.ejs'                                                                                &&
export SERVER_SRC_FOLDER='src/server'                                                                             &&
export URL_APP_RELOAD_SERVER='http://localhost:6601'                                                              &&
export URL_BROWSER_RELOAD_SERVER='http://localhost:6602'
