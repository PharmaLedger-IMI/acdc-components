# Notes about the docker Image

Before building the Docker Image check and update if necessary t

## Creating docker volume external-volume

```
pharmaledger@acdc-dev-pl:~$ docker volume create external-volume

pharmaledger@acdc-dev-pl:~$ docker volume inspect external-volume
[
    {
        "CreatedAt": "2021-06-04T10:29:31Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/external-volume/_data",
        "Name": "external-volume",
        "Options": {},
        "Scope": "local"
    }
]
```

## Initializing docker volume external-volume
```
pharmaledger@acdc-dev-pl:~$ sudo rm -rf /var/lib/docker/volumes/external-volume/_data/*


jpsl@PDM-00781:/export/home/jpsl/develop/PharmaLedger/acdc-workspace$ npm run clean

jpsl@PDM-00781:/export/home/jpsl/develop/PharmaLedger$ scp -rp acdc-workspace/apihub-root/external-volume pharmaledger@192.168.13.104:external-volume

pharmaledger@acdc-dev-pl:~$ sudo cp -r external-volume/* /var/lib/docker/volumes/external-volume/_data/

```
