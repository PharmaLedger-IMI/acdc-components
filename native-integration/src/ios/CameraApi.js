const {PLRgbImage} = require('./util/PLRgbImage');
const {PLYCbCrImage} = require('./util/PLYCbCrImage');
const {STATUS, CameraInterface} = require('../CameraInterface');
const {CameraProps} = require("./util/CameraProps");
const {PLCameraConfig} = require("./util/PLCameraConfig");
const {deviceTypeNames, sessionPresetNames} = require('./util/constants');
const {CameraCapabilities} = require("../CameraCapabilities");
const {TORCH_MODE, CAMERA_TYPE} = require('../constants');
const bridge = require('./util/bridge');

const MODE = {
    GL: "gl",
    MJPEG: "mjpeg"
}

class CameraApi extends CameraInterface{
    cameraProps;
    nativeBridge = bridge;

    __canvas;
    __scene;
    __camera;
    __renderer;
    __material;

    _status;
    __statusHandler;

    __streamElement;

    constructor(cameraProps){
        super();
        this.cameraProps = cameraProps || new CameraProps();
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
       return this.nativeBridge.onFramePreview(this, rgbImage, elapsedTime);
    }

    /**
     * @param {PLRgbImage | PLYCbCrImage} plImage raw data coming from native camera
     * @param {number} elapsedTime time in ms elapsed to get the raw frame
     */
    _onFrameGrabbed(plImage, elapsedTime) {
        return this.nativeBridge.onFrameGrabbed(this, plImage, elapsedTime);
    }

    _onPictureTaken(base64ImageData) {
        this.__canvas.src = base64ImageData;
        this._updateStatus("New Picture taken");
    }

    _onNativeCameraInitialized(...args){
        this._updateStatus("Native Camera Initialized");
        return this.nativeBridge.onNativeCameraInitialized(this)(...args);
    }

    _onCameraInitializedCallBack() {
        switch(this.__streamElement.tag){
            case "video":
                this.__streamElement.srcObject = `${this.cameraProps._serverUrl}/mjpeg`;
                break;
            default:
                this.__streamElement.src = `${this.cameraProps._serverUrl}/mjpeg`;
        }

        this._updateStatus("Camera Initialized");
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

    async bindStreamToElement(canvas, cfg){
        if (!cfg)
            return this._startNativeCamera();
        if (!cfg.mode)
            cfg = Object.assign( {mode: MODE.GL}, cfg);
        this.cameraProps._onCameraInitializedCallBack = this._onCameraInitializedCallBack.bind(this);
        this.__canvas = canvas;
        const {_x, _y, _w, _h} = this.cameraProps;
        this.setCrop(_x, _y, _w, _h);
        const config = new PLCameraConfig(this.cameraProps.selectedPresetName, this.cameraProps.flashMode, this.cameraProps.afOn, true, this.cameraProps.selectedDevicesNames, this.cameraProps.selectedCamera, true, this.cameraProps.selectedColorspace, parseFloat(this.cameraProps.torchRange));
        const isGL = cfg.mode === MODE.GL;
        if (isGL)
            this.nativeBridge.setupGLView.call(this, this.cameraProps.previewWidth, this.cameraProps.previewHeight);
        this.nativeBridge.startNativeCameraWithConfig(
            this.cameraProps,
            config,
            undefined,
            cfg.targetPreviewFPS ||this.cameraProps.targetPreviewFPS,
            cfg.previewWidth || this.cameraProps.previewWidth,
            isGL ? this._onFramePreview: this._onFrameGrabbed,
            cfg.targetRawFPS || this.cameraProps.targetRawFPS,
            isGL ? this._onFrameGrabbed : this._onCameraInitializedCallBack,
            _x,
            _y,
            _w,
            _h,
            cfg.ycbcrCheck);
    }

    async getCameraStream(...args){
        throw new Error(`Not implemented`);
    }

    closeCameraStream(){
        this.nativeBridge.stopNativeCamera(this.cameraProps);
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
        this.nativeBridge.setRawCropRoi(this.cameraProps, x, y, w, h);
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