#!/bin/bash -x
# Start all services
PRG_NAME=`basename $0`
PRG_DIR=`dirname $0`
PRG_DIR=`cd "$PRG_DIR" >/dev/null ; pwd`
# Using nvm for now
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
(
    cd "$PRG_DIR/../.."
    nvm use 
    npm run server &
    sleep 2
    cd acdc/backoffice-backend
    npm run start &
    sleep 5
    cd ../backoffice-frontend
    npm run start &
) >> "$PRG_DIR/../../../acdc.log" 2>&1
# This should be a replaced by a system-unit (one for every service),
# and every service should have its log, and log rotation.
# But for PoC this should suffice.
