#!/bin/bash
UCNAME="acdc-backoffice-backend"

# runs in network=host mode to access localhost:5432
# --publish 3000:3000 \

docker run --detach \
    --network="host" \
    --hostname $UCNAME \
    --name $UCNAME \
    --restart always \
    pharmaledger/$UCNAME

