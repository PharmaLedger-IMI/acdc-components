#!/bin/bash

docker build -t pharmaledger/acdc-backoffice-backend "$(dirname $(readlink -f $0))" --no-cache --network host
