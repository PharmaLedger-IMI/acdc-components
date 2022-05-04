#!/bin/bash -x
PRG_NAME=`basename $0`
PRG_DIR=`dirname $0`
PRG_DIR=`cd "$PRG_DIR" >/dev/null ; pwd`
cp -TRv "$PRG_DIR/apihub/" "$PRG_DIR/../../apihub-root/"