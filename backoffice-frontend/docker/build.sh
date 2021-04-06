#!/bin/bash -x

docker build -t pharmaledger/acdc-backoffice-frontend "$(dirname $(readlink -f $0))" --no-cache --network host
