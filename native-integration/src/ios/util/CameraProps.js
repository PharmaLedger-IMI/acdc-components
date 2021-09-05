const {THREE} = require('../lib/lib');

class CameraProps {
    previewWidth = 360;
    previewHeight = Math.round(this.previewWidth * 16 / 9); // assume 16:9 portrait at start
    targetPreviewFPS = 25;
    fpsMeasurementInterval = 5;
    previewFramesCounter = 0;
    previewFramesElapsedSum = 0;
    previewFramesMeasuredFPS = 0;
    targetRawFPS = 10;
    rawCrop_x = undefined;
    rawCrop_y = undefined;
    rawCrop_w = undefined;
    rawCrop_h = undefined;
    rawFramesCounter = 0;
    rawFramesElapsedSum = 0;
    rawFramesMeasuredFPS = 0;
    bytePerChannel = 3;

    formatTexture = undefined;

    flashMode = 'off'
    usingMJPEG = false

    afOn = true;
    selectedCamera = "back";
    selectedColorspace = undefined;

    //START VARS FROM BRIDGE FILE 
    _previewHandle = undefined;
    _grabHandle = undefined;
    _onFramePreviewCallback = undefined;
    _targetPreviewFps = 20;
    _previewWidth = 0;
    _serverUrl = undefined;
    _cameraRunning = false;
    _onFrameGrabbedCallBack = undefined;
    _onCameraInitializedCallBack = undefined;
    _targetGrabFps = 10;
    _ycbcr = false;
    _x = undefined;
    _y = undefined;
    _w = undefined;
    _h = undefined;
    
    constructor(props){
        if (typeof props === 'object')
            for (let key in props)
                if (props.hasOwnProperty(key))
                    this[key] = props[key];

        if (this.bytePerChannel === 4)
            this.formatTexture = THREE.RGBAFormat;
        else if (this.bytePerChannel === 3)
            this.formatTexture = THREE.RGBFormat;

    }
}

module.exports = {
    CameraProps
}