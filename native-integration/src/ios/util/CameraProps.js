const {THREE} = require('../lib/lib');
const {deviceTypeNames, colorSpaces} = require('../util/constants')

class CameraProps {
    renderer;
    camera;
    scene;
    canvasgl;
    material;
    previewWidth = 360;
    previewHeight = 0; // assume 16:9 portrait at start
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
    controls;
    bytePerChannel = 3;

    formatTexture;
    flashMode = 'off'
    usingMJPEG = false
    status_test;
    status_fps_preview;
    status_fps_raw;
    configInfo;
    afOn = true;
    selectedCamera = "back";
    selectedColorspace = undefined;
    torchRange;
    snapshotImage;
    invertRawFrameCheck;
    cropRawFrameCheck;
    ycbcrCheck;
    rawCropRoiInput;
    select_preset;
    selectedPresetName;
    select_cameras;
    selectedDevicesNames;
    
    constructor(props){
        if (typeof props === 'object')
            for (let key in props)
                if (props.hasOwnProperty(key))
                    this[key] = props[key];

        this.previewHeight= Math.round(this.previewWidth * 16 / 9);

        if (this.bytePerChannel === 4)
            this.formatTexture = THREE.RGBAFormat;
        else if (this.bytePerChannel === 3)
            this.formatTexture = THREE.RGBFormat;
    }
}

module.exports = {
    CameraProps
}