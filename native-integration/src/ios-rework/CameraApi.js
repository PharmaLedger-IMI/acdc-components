const {PLRgbImage} = require('./util/PLRgbImage');
const {PLYCbCrImage} = require('./util/PLYCbCrImage');
const {STATUS, CameraInterface} = require('../CameraInterface');
const {CameraProps} = require("./util/CameraProps");
const {PLCameraConfig} = require("./util/PLCameraConfig");
const constants = require('./util/constants');
const {deviceTypeNames, sessionPresetNames} = constants;
const {CameraCapabilities} = require("../CameraCapabilities");
const {TORCH_MODE, CAMERA_TYPE} = require('../constants');
const bridge = require('./util/bridge');
const {THREE} = require('./lib/lib')

const MODE = {
    GL: "gl",
    MJPEG: "mjpeg"
}

class CameraApi extends CameraInterface{
    cameraProps;
    nativeBridge = bridge;
    constants = constants;
    imageTypes = {
        PLYCbCrImage,
        PLRgbImage
    };
    THREE = THREE;
    PLCameraConfig = PLCameraConfig;

    _status;
    __statusHandler;

    _handlers = {
        onFramePreview: undefined,
        onFrameGrabbed: undefined,
        onPictureTaken: undefined,
        onCameraInitialized: () => console.log(`Camera Initialized`)
    }

    constructor(cameraProps){
        super();
        this.cameraProps = cameraProps || new CameraProps();
    }

    registerHandlers(onFramePreview, onFrameGrabbed, onPictureTaken, onCameraInitialized){
        this._handlers = {
            onFramePreview: onFramePreview,
            onFrameGrabbed: onFrameGrabbed,
            onPictureTaken: onPictureTaken,
            onCameraInitialized: onCameraInitialized || this._handlers.onCameraInitialized
        }
    }

    async _startNativeCamera(element){
        this.__streamElement = element;
        const {sessionPresetName, flashMode, targetPreviewFps, previewWidth, targetGrabFps} = this.cameraProps;
        const {_x, _y, _w, _h} = this.cameraProps;
        this.setCrop(_x, _y, _w, _h);
        this.nativeBridge.startNativeCamera(this.cameraProps,
            sessionPresetName,
            flashMode,
            undefined,
            targetPreviewFps,
            previewWidth,
            undefined,
            targetGrabFps,
            _x,
            _y,
            _w,
            _h
        )
    }

    /**
     * @param {PLRgbImage} rgbImage preview data coming from native camera. Can be used to create a new Uint8Array
     * @param {number} elapsedTime time in ms elapsed to get the preview frame
     */
    _onFramePreview(rgbImage, elapsedTime) {
       return this._handlers.onFramePreview(rgbImage, elapsedTime);
    }

    /**
     * @param {PLRgbImage | PLYCbCrImage} plImage raw data coming from native camera
     * @param {number} elapsedTime time in ms elapsed to get the raw frame
     */
    _onFrameGrabbed(plImage, elapsedTime) {
        return this._handlers.onFrameGrabbed(plImage, elapsedTime);
    }

    _onPictureTaken(base64ImageData) {
        return this._handlers.onPictureTaken(base64ImageData);
    }

    _onNativeCameraInitialized(...args){
        this._updateStatus("Native Camera Initialized");
        this.nativeBridge.onNativeCameraInitialized(...args);
    }

    _onCameraInitializedCallBack() {
        return this._handlers.onCameraInitialized();
    }

    _updateStatus(message){
        this._status = message;
        if (this.__statusHandler)
            this.__statusHandler(message);
    }

    async isAvailable(){
        return true;
    }

    async getConstraints(){
        return this.nativeBridge.getCameraConfiguration(this.cameraProps);
    }

    async bindStreamToElement(element, cfg){

        this.cameraProps.previewWidth = element.width;
        this.cameraProps.previewHeight = element.height;

        const getBindingProp = function(tag){
            switch (element.tag){
                case 'img':
                    return 'src';
                case 'video':
                    return 'srcObject';
                case 'canvas':
                    return 'src';
                default:
                    throw new Error("element Not supported");
            }
        }

        this.getCameraStream((err, stream) => {
            const prop = getBindingProp(element.tag);
            element[prop] = stream;
        });
    }

    getCameraStream(options, callback){
        if (!callback){
            callback = options;
            options = undefined;
        }

        const {selectedPresetName, flashMode, afOn, selectedCamera, selectedColorspace, torchRange} = this.cameraProps;

        const config = new PLCameraConfig(selectedPresetName,
            flashMode, afOn, true,
            this.selectedDevicesNames, selectedCamera,
            true, selectedColorspace,
            torchRange);

        this.Camera.nativeBridge.startNativeCameraWithConfig(
            config,
            undefined,
            this.cameraProps.targetPreviewFPS,
            this.cameraProps.previewWidth,
            undefined,
            this.cameraProps.targetRawFPS,
            () => {
                callback(undefined, `${this.Camera.cameraProps._serverUrl}/mjpeg`);
            },
            undefined,
            undefined,
            undefined,
            undefined,
            true);
    }

    closeCameraStream(){
        this.nativeBridge.stopNativeCamera();
        this._updateStatus("Camera Stopped");
    }

    switchCamera(...args){
        if (this.cameraProps.selectedCamera === CAMERA_TYPE.BACK) {
            this.cameraProps.selectedCamera = CAMERA_TYPE.FRONT;
            this._updateStatus("Front Cam");
            return CAMERA_TYPE.FRONT;
        } else {
            this.cameraProps.selectedCamera = CAMERA_TYPE.BACK;
            this._updateStatus("Back Cam");
            return CAMERA_TYPE.BACK;
        }
    }

    /**
     *
     * @param {function(string): void} [handler] when not provided, will return the current status.
     * Otherwise handler will be called on status update
     * @returns {*}
     */
    getStatus(handler, ...args){
        if (!handler)
            return this._status;
        this.__statusHandler = handler;
    }

    hasPermissions(...args){
        throw new Error(`Not implemented`);
    }

    async takePicture(mode = MODE.GL){
        switch(mode){
            case MODE.GL:
                this.nativeBridge.takePictureBase64NativeCamera(this._onPictureTaken.name);
                break;
            case MODE.MJPEG:
                await this.nativeBridge.getSnapshot(this.cameraProps).then(b => this._onPictureTaken(URL.createObjectURL(b)))
        }
    }

    toggleTorch(){
        switch (this.cameraProps.flashMode) {
            case TORCH_MODE.OFF:
                this.cameraProps.flashMode = TORCH_MODE.FLASH;
                break;
            case TORCH_MODE.FLASH:
                this.cameraProps.flashMode = TORCH_MODE.ON;
                break;
            case TORCH_MODE.ON:
                this.cameraProps.flashMode = TORCH_MODE.OFF;
                break;
            default:
                break;
        }
        this.nativeBridge.setFlashModeNativeCamera(this.cameraProps.flashMode);
        this._updateStatus(`FLASH MODE: ${this.cameraProps.flashMode}`);
        return this.cameraProps.flashMode;
    }

    setTorchLevel(level){
        this.nativeBridge.setTorchLevelNativeCamera(level);
        this._updateStatus(`Torch Level: ${level}`);
    }

    setColorSpace(nextColorSpace){
        this.nativeBridge.setPreferredColorSpaceNativeCamera(nextColorSpace);
        this._updateStatus(`Colorspace: ${nextColorSpace}`);
    }

    /**
     * Sets the raw crop to a new position
     * @param  {number} x
     * @param  {number} y
     * @param  {number} w
     * @param  {number} h
     */
    setCrop(x, y, w, h){
        const {rawCrop_x, rawCrop_y, rawCrop_w, rawCrop_h} = this.cameraProps;
        this.nativeBridge.setRawCropRoi(rawCrop_x, rawCrop_y, rawCrop_w, rawCrop_h);
        return true;
    }

    toggleContinuousAF(){
        if (this.cameraProps.afOn === true) {
            this.cameraProps.afOn = false;
            this._updateStatus("AutoFocus OFF");
            return false;
        } else {
            this.cameraProps.afOn = true;
            this._updateStatus("AutoFocus ON");
            return true;
        }
    }

    getDeviceTypes(){
        return deviceTypeNames;
    }

    getCapabilities(){
        return new CameraCapabilities({
            cameraEnv: 'ios',
            getCameraStream: false,
            sessionPresetNames: sessionPresetNames
        });
    }

    selectPreset(preset){
        this.cameraProps.selectedPresetName = preset;
    }
}

module.exports = {
    CameraApi
}