const securityContext = require("opendsu").loadApi("sc");
const mainDSU = securityContext.getMainDSU();

function mountDSU(path, keySSI, callback) {
    mainDSU.mount(path, keySSI, callback);
}

function listDSUs(path, callback) {
    mainDSU.listMountedDossiers(path, callback);
}

function loadDSU(keySSI, callback) {
    const resolver = require("opendsu").loadAPI("resolver");
    resolver.loadDSU(keySSI, callback);
}

function listFolders(path, callback) {
    if (path.endsWith("/")) {
        path = path.slice(0, -1);
    }
    mainDSU.listFolders(path, {ignoreMounts: false}, callback);
}

function refreshDSUMountedAtPath(path, callback) {
    if (path.endsWith("/")) {
        path = path.slice(0, -1);
    }

    mainDSU.getArchiveForPath(path, (err, dsuContext) => {
        if (err) {
            return callback(err);
        }

        dsuContext.archive.refresh(callback);
    });
}

module.exports = {
    mountDSU,
    listDSUs,
    listFolders,
    loadDSU,
    refreshDSUMountedAtPath
}
