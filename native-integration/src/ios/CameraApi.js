const {STATUS, CameraInterface} = require('../CameraInterface');
const {CameraProps} = require("./util/CameraProps");
const {setTorchLevelNativeCamera, getCameraConfiguration, setPreferredColorSpaceNativeCamera} = require('./util/bridge');

class CameraApi extends CameraInterface{
    cameraProps;

    constructor(cameraProps){
        super();
        this.cameraProps = cameraProps || new CameraProps();
    }

    async isAvailable(){
        throw new Error(`Not implemented`);
    }

    async getConstraints(...args){
        const config = await getCameraConfiguration(this.cameraProps);
        return config;
    }

    async bindStreamToElement(element, ...args){
        throw new Error(`Not implemented`);
    }

    async getCameraStream(...args){
        throw new Error(`Not implemented`);
    }

    closeCameraStream(...args){
        throw new Error(`Not implemented`);
    }

    switchCamera(...args){
        if (this.cameraProps.selectedCamera === "back") {
            this.cameraProps.selectedCamera = "front";
            return "FRONT";
        } else {
            this.cameraProps.selectedCamera = "back";
            this.cameraProps.selectCameraButton.innerHTML = "Back Cam";
            return "BACK";
        }
    }

    getStatus(...args){
        throw new Error(`Not implemented`);
    }

    hasPermissions(...args){
        throw new Error(`Not implemented`);
    }

    setTorchLevel(level){
        setTorchLevelNativeCamera(level);
    }

    setColorSpace(nextColorSpace){
        setPreferredColorSpaceNativeCamera(nextColorSpace);
    }

    toggleContinuousAF(){
        if (this.cameraProps.afOn === true) {
            this.cameraProps.afOn = false;
            return false;
        } else {
            this.cameraProps.afOn = true;
            return true;
        }
    }

}

module.exports = {
    CameraApi
}