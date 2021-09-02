const {STATUS, CameraInterface} = require('../CameraInterface');

class CameraApi extends CameraInterface{
    _hasPermissions = undefined;
    _status = undefined;

    __stream = undefined;

    async _getConstraints(){
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
            this._status = STATUS.NO_DETECTION;
            return;
        }
        const constraints = await this._getConstraints();

        if (this.__stream)
            this.closeCameraStream();

        try{
            this.__stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e){
            this._hasPermissions = false;
            this._status = STATUS.NO_PERMISSION;
            return;
        }

        if (!this.__stream){
            this._status = STATUS.NO_PERMISSION;
            this._hasPermissions = false;
            return;
        }

        this._hasPermissions = true;
        return this.__stream;
    }

    closeCameraStream(){
        if (!this.__stream || !this.__stream.getTracks)
            return;
        this.__stream.getTracks().forEach(t => t.readyState === 'live' && t.stop());
    };

    getStatus(){
        return this._status;
    }

    hasPermissions(){
        return this._hasPermissions;
    };

    async bindStreamToElement(element){
        const stream = this.getCameraStream();
        if (stream && element)
            element.srcObject = stream;
        else
            console.error(`Missing stream or destination element`, stream, element);
    }

    async getCameraStream(){
        return await this._getPermissions();
    }

    switchCamera(){
        console.log("Not supported");
    };
}