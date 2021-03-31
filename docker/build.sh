#!/bin/bash

docker build -t pharmaledger/acdc-workspace "$(dirname $(readlink -f $0))" --no-cache --network host
