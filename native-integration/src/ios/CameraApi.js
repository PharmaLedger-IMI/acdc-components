const {STATUS, CameraInterface} = require('../CameraInterface');

class CameraApi extends CameraInterface{


    async getCameraStream(){

    }

    switchCamera(){

    };

}

window.Camera = new CameraApi();