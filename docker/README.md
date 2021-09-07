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

# allow all users in the docker to rw from the external-volume
# pharmaledger@acdc-dev-pl:~$ sudo chmod -R +rw /var/lib/docker/volumes/external-volume/_data

```

## Manually reseting the docker volume external-volume contents
```
docker exec -it acdc-workspace /bin/bash
root@acdc-workspace:/# npm run clean
root@acdc-workspace:/# npm run build-all
```


# How to backup the simulated blockchain under external-volume and update just the leaflet-ssapp

**WARNING: IT SEEMS NOT WORK!**

users from previous MAH Enterprise Wallet no longer work.


1 - Before deploying new code...

Taking note of MAH login with devsuperuser wallet: 
```
 Loading wallet 65FmT6jYpmQXhAkCPpZszbiD7gZheDbkuNxYAF3to7hTSggeVXpdBFkpLFuZQgfkFoFSWDb12Zp5nn3oHE8R2kDZthG3Z1Ld
```

```
pharmaledger@acdc-dev-pl:~$ docker exec -it acdc-workspace /bin/bash
root@acdc-workspace:/# cd acdc-workspace/
root@acdc-workspace:/acdc-workspace# node bin/seedsBackupTool.js backup
pharmaledger@acdc-dev-pl:~$ docker cp acdc-workspace:/acdc-workspace/apihub-root/seedsBackup .
```

a file seedsBackup is left in pharmaledger@acdc-dev-pl:~/seedsBackup


2 - deploying

```
./docker/build.sh ; ./docker/deployDev.sh
```

Wait 1+ minute for the build... (see build log)

3 - Edit the seedBackup file to eliminate the file for the app you want to update

In this example, removed all seeds related to leaflet-ssapp from a file named seedBackup.edited (a clone of the previous seedBackup):
```
...
"apihub-root/leaflet-wallet/apps-patch/leaflet-ssapp/seed":"BBudGH6ySHG6GUHN8ogNrTWbxkcz3vUcppaM2pPmnL7jkp7AruuXpnPWp1pVDmfucsnydwJnDngmV1THRy7m84AzT",
"apihub-root/leaflet-wallet/wallet-patch/seed":"BBudGH6ySHG6GUHN8ogNrTWbxkcz3vUcppaM2pPmnL7jkp7AruuXpnPWp1pVDmfucsnydwJnDngmV1THRy7m84AzT",
...
"leaflet-ssapp/seed":"BBudGH6ySHG6GUHN8ogNrTWbxkcz3vUcppaM2pPmnL7jkp7AruuXpnPWp1pVDmfucsnydwJnDngmV1THRy7m84AzT"
...
```

4 - Restore backup

```
pharmaledger@acdc-dev-pl:~$ docker cp seedsBackup.edited acdc-workspace:/acdc-workspace/apihub-root/seedsBackup
pharmaledger@acdc-dev-pl:~$ docker exec -it acdc-workspace /bin/bash
root@acdc-workspace:/# cd acdc-workspace/
root@acdc-workspace:/acdc-workspace# node bin/seedsBackupTool.js # WRONG - REMOVE
root@acdc-workspace:/acdc-workspace# npm run build-all
```

After deploy
```
Loading wallet 65FmT6jYpmQXhAkCPpZszbiD7gZheDbkuNxYAF3to7hTSggeVXpdBFkpLFuZQgfkFoFSWDb12Zp5nn3oHE8R2kDZthG3Z1Ld
```
