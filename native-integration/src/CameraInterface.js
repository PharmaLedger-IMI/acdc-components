const STATUS = {
    IN_PROGRESS: "Camera detection in progress...",
    DONE: "Scan done.",
    NO_DETECTION: "No camera detected.",
    NO_PERMISSION: "No permission given"
}

class CameraInterface {

    async bindStreamToElement(element, ...args){
        throw new Error(`Not implemented`);
    }

    async getCameraStream(...args){
        throw new Error(`Not implemented`);
    };

    closeCameraStream(...args){
        throw new Error(`Not implemented`);
    };

    switchCamera(...args){
        throw new Error(`Not implemented`);
    };

    getStatus(...args){
        throw new Error(`Not implemented`);
    };

    hasPermissions(...args){
        throw new Error(`Not implemented`);
    };
}

module.exports = {
    CameraInterface,
    STATUS
}