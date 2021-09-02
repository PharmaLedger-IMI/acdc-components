const STATUS = {
    IN_PROGRESS: "Camera detection in progress...",
    DONE: "Scan done.",
    NO_DETECTION: "No camera detected.",
    NO_PERMISSION: "No permission given"
}

class CameraInterface {
    async getCameraStream(){};

    closeCameraStream(){};

    switchCamera(){};

    getStatus(){};

    hasPermissions(){};
}

module.export = {
    CameraInterface,
    STATUS
}