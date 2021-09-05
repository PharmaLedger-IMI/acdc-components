class CameraCapabilities {
    cameraEnv = undefined;
    getConstraints = true;
    bindStreamToElement = true;
    getCameraStream = true;
    closeCameraStream = true;
    switchCamera = true;
    getStatus = true;
    hasPermission = true;
    takePicture = true;
    toggleTorch = true;
    setTorchLevel = true;
    setColorSpace = true;
    setCrop = true;
    toggleContinuousAF = true;
    getDeviceTypes = true;

    constructor(props) {
        if (!!props)
            for(let prop in props)
                if (props.hasOwnProperty(prop))
                    this[prop] = props[prop];
        if (!this.cameraEnv)
            throw new Error(`Missing camera environment - 'ios', 'android' or 'default'`)
    }
}

module.exports = {
    CameraCapabilities
}