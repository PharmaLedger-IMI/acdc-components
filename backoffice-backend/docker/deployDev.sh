#!/bin/bash -xe
# Deploy docker image to DEV environment.
# (Docker image must be first build using the ../build.sh script).

PRG_NAME=`basename $0`
PRG_DIR=`dirname $0`
PRG_DIR=`cd "$PRG_DIR" >/dev/null ; pwd`

UCNAME="acdc-backoffice-backend"
# pharmaledger at acdc-dev-pl
USERATHOST="pharmaledger@192.168.13.104"

cd $PRG_DIR/..

if test -z `which docker`
then
    echo 1>&2 "$PRG_NAME: docker must be in PATH"
    exit 1
fi

if test -z `which xz`
then
    echo 1>&2 "$PRG_NAME: xz must be in PATH"
    exit 1
fi

if test -z `which ssh`
then
    echo 1>&2 "$PRG_NAME: ssh must be in PATH"
    exit 1
fi

# Image .tar name based on current date and time
#IMG_NAME=fgtYYYYMMDDHHMISS
IMG_NAME=${UCNAME}$(date +%Y%m%d%H%M%S).tar.xz

# Remove tmp file on exit
trap "rm -f /tmp/$IMG_NAME" EXIT

# Saving and compressimg docker $UCNAME to /tmp/$IMG_NAME.xz. (Use all CPU threads when compressing).
docker save pharmaledger/$UCNAME | nice xz -T0 > /tmp/$IMG_NAME

# uploading /tmp/$IMG_NAME.xz to $USERATHOST:images/
scp -p /tmp/$IMG_NAME $USERATHOST:images/

# stop and delete all running images. Then load and start the new one.
ssh $USERATHOST <<EOF
set -xe
echo "When you see a message like '[NestApplication] Nest application successfully started' you may CTL-C to exit."
docker stop $UCNAME
docker rm $UCNAME
docker rmi pharmaledger/$UCNAME
( xz -d < images/$IMG_NAME | docker load )
docker run --detach --network="host" --hostname $UCNAME --publish 3000:3000 --name $UCNAME --restart always pharmaledger/$UCNAME
docker logs -f $UCNAME
EOF


