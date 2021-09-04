const {STATUS, CameraInterface} = require('../CameraInterface');

class CameraApi extends CameraInterface{

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

    getStatus(...args){
        throw new Error(`Not implemented`);
    };

    hasPermissions(...args){
        throw new Error(`Not implemented`);
    };
}

module.exports = {
    CameraApi
}