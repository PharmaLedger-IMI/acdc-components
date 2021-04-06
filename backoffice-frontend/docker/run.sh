#!/bin/bash
UCNAME="acdc-backoffice-frontend"

docker run --detach \
    --hostname $UCNAME \
    --publish 8000:80 \
    --name $UCNAME \
    --restart always \
    pharmaledger/$UCNAME
