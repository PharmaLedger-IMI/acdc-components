const STATUS = {
    IN_PROGRESS: "Camera detection in progress...",
    DONE: "Scan done.",
    NO_DETECTION: "No camera detected.",
    NO_PERMISSION: "No permission given"
}

const {CameraCapabilities} = require('./CameraCapabilities');

class CameraInterface {

    getCapabilities(){
        return new CameraCapabilities({
            cameraEnv: 'default'
        });
    }

    async isAvailable(){
        throw new Error(`Not implemented`);
    }

    getConstraints(...args){
        throw new Error(`Not implemented`);
    }

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

    /**
     *
     * @param {function(string): void} [handler] when not provided, will return the current status.
     * Otherwise handler will be called on status update
     * @returns {*}
     */
    getStatus(handler, ...args){
        throw new Error(`Not implemented`);
    };

    hasPermissions(...args){
        throw new Error(`Not implemented`);
    };

    async takePicture(...args){
        throw new Error(`Not implemented`);
    }

    toggleTorch(...args){
        throw new Error(`Not implemented`);
    }

    setTorchLevel(...args){
        throw new Error(`Not implemented`);
    }

    setColorSpace(...args){
        throw new Error(`Not implemented`);
    }

    setCrop(x, y, w, h, ...args){
        throw new Error(`Not implemented`);
    }

    toggleContinuousAF(...args){
        throw new Error(`Not implemented`);
    }

    getDeviceTypes(...args){
        throw new Error(`Not implemented`);
    }

    selectPreset(...args){
        throw new Error(`Not implemented`);
    }

}

module.exports = {
    CameraInterface,
    STATUS
}