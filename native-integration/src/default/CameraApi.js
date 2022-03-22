const {STATUS, CameraInterface} = require('../CameraInterface');
const {CameraCapabilities} = require('../CameraCapabilities');

class CameraApi extends CameraInterface{
    _hasPermissions = undefined;
    _status = undefined;

    __statusHandler;

    __stream = undefined;
    __devices = undefined;
    __activeDeviceId = undefined;

    async getConstraints(){
        const constraints = {
            video: {
                facingMode: 'environment'
            }
        };
        const deviceId = this.activeDeviceId;
        if (deviceId && deviceId !== 'no-camera') {
            delete constraints.video.facingMode;
            constraints.video['deviceId'] = {
                exact: deviceId
            };
        }

        return constraints;
    }

    async _getPermissions(){

        if (!(navigator &&'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)) {
            this._hasPermissions = false;
            this._updateStatus(STATUS.NO_DETECTION);
            return;
        }
        const constraints = await this.getConstraints();

        if (this.__stream)
            this.closeCameraStream();

        try{
            this.__stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e){
            this._hasPermissions = false;
            this._updateStatus(STATUS.NO_PERMISSION);
            return;
        }

        if (!this.__stream){
            this._updateStatus(STATUS.NO_PERMISSION);
            this._hasPermissions = false;
            return;
        }

        this._hasPermissions = true;
        return this.__stream;
    }

    async isAvailable(){
        const self = this;
        return await this.getDeviceTypes().then(devices => {
            self.__devices = devices.filter(d => d.kind === 'videoinput');
            return !!self.__devices.length;
        });
    }

    closeCameraStream(){
        if (!this.__stream || !this.__stream.getTracks)
            return;
        this.__stream.getTracks().forEach(t => t.readyState === 'live' && t.stop());
        this.__stream = undefined;
    };

    getStatus(handler){
        if (!handler)
            return this._status;
        this.__statusHandler = handler;
    }

    _updateStatus(message){
        this._status = message;
        if (this.__statusHandler)
            this.__statusHandler(message);
    }

    hasPermissions(){
        return this._hasPermissions || false;
    };

    async bindStreamToElement(element){
        const stream = await this.getCameraStream();
        if (stream && element)
            element.srcObject = stream;
        else
            console.error(`Missing stream or destination element`, stream, element);
    }

    async getCameraStream(){
        return await this._getPermissions();
    }

    switchCamera(){
        let devices = [undefined];

        for (const device of this.__devices)
            devices.push(device.deviceId);

        let currentIndex = devices.indexOf(this.activeDeviceId);
        if (currentIndex === devices.length - 1)
            currentIndex = -1;

        currentIndex++;

        this.activeDeviceId = devices[currentIndex];

        this._updateStatus(`Current Device Id: ${this.activeDeviceId}`);
    };

    async takePicture(...args){
        console.log(`Not implemented`);
    }

    toggleTorch(...args){
        console.log(`Not implemented`);
    }

    setTorchLevel(...args){
        console.log(`Not implemented`);
    }

    setColorSpace(...args){
        console.log(`Not implemented`);
    }

    setCrop(x, y, w, h, ...args){
        console.log(`Not implemented`);
    }

    toggleContinuousAF(...args){
        console.log(`Not implemented`);
    }

    getCapabilities(){
        return new CameraCapabilities({
            cameraEnv: 'default',
            takePicture: false,
            toggleTorch: false,
            setTorchLevel: false,
            setColorSpace: false,
            setCrop: false,
            toggleContinuousAf: false
        });
    }

    async getDeviceTypes(){
        return await navigator.mediaDevices.enumerateDevices();
    }

    selectPreset(...args){
        console.log(`Not implemented`);
    }
}

module.exports = {
    CameraApi
}