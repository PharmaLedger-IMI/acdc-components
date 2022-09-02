#!/bin/bash -xe
PRG_NAME=`basename $0`
PRG_DIR=`dirname $0`
PRG_DIR=`cd "$PRG_DIR" >/dev/null ; pwd`
cat >"$PRG_DIR/../../apihub-root/index.html" <<'EOF'
<html><body>It is up!</body></html>
EOF
cd "$PRG_DIR/../../apihub-root/"
rm -rf demiurge-wallet
rm -rf dsu-explorer
rm -rf leaflet-wallet
