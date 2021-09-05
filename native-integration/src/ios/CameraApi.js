const THREE = require('../../node_modules/three/build/three');
require('../../node_modules/three/examples/js/controls/OrbitControls');
const {STATUS, CameraInterface} = require('../CameraInterface');
const {CameraProps} = require("./util/CameraProps");
const {deviceTypeNames} = require('./util/constants');
const {setTorchLevelNativeCamera,
    getCameraConfiguration,
    setPreferredColorSpaceNativeCamera,
    startNativeCameraWithConfig,
    startNativeCamera,
    takePictureBase64NativeCamera,
    setFlashModeNativeCamera,
    getSnapshot,
    stopNativeCamera,
    setRawCropRoi,
    placeUint8RGBArrayInCanvas,
    placeUint8GrayScaleArrayInCanvas,
    placeUint8CbCrArrayInCanvas
} = require('./util/bridge');
const {CameraCapabilities} = require("../CameraCapabilities");

const MODE = {
    GL: "gl",
    MJPEG: "mjpeg"
}

class CameraApi extends CameraInterface{
    cameraProps;

    __canvas;
    __scene;
    __camera;
    __renderer;
    __material;

    _status;
    __statusHandler;

    constructor(cameraProps){
        super();
        this.cameraProps = cameraProps || new CameraProps();
    }

    _startNativeCamera(){
        const {sessionPresetName, flashMode, targetPreviewFps, previewWidth, targetGrabFps} = this.cameraProps;
        const {_x, _y, _w, _h} = this.cameraProps;
        this.setCrop(_x, _y, _w, _h);
        startNativeCamera(this.cameraProps,
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

    _animate() {
        window.requestAnimationFrame(() => this._animate());
        this.__renderer.render(this.__scene, this.__camera);
    }

    /**
     * @param {PLRgbImage} rgbImage preview data coming from native camera. Can be used to create a new Uint8Array
     * @param {number} elapsedTime time in ms elapsed to get the preview frame
     */
    _onFramePreview(rgbImage, elapsedTime) {
        var frame = new Uint8Array(rgbImage.arrayBuffer);
        if (rgbImage.width !== this.cameraProps.previewWidth || rgbImage.height !== this.cameraProps.previewHeight) {
            this.cameraProps.previewWidth = rgbImage.width;
            this.cameraProps.previewHeight = rgbImage.height;
            this._setupGLView(cameraProps.previewWidth, cameraProps.previewHeight);
        }
        this.__material.map = new THREE.DataTexture(frame, rgbImage.width, rgbImage.height, this.cameraProps.formatTexture, THREE.UnsignedByteType);
        this.__material.map.flipY = true;
        this.__material.needsUpdate = true;


        if (this.cameraProps.previewFramesCounter !== 0 && this.cameraProps.previewFramesCounter % (this.cameraProps.fpsMeasurementInterval - 1) === 0) {
            this.cameraProps.previewFramesMeasuredFPS = 1000 / this.cameraProps.previewFramesElapsedSum * this.cameraProps.fpsMeasurementInterval;
            this.cameraProps.previewFramesCounter = 0;
            this.cameraProps.previewFramesElapsedSum = 0;
        } else {
            this.cameraProps.previewFramesCounter += 1;
            this.cameraProps.previewFramesElapsedSum += elapsedTime;
        }
        this._updateStatus(`preview ${Math.round(elapsedTime)} ms (max FPS=${Math.round(this.cameraProps.previewFramesMeasuredFPS)})`);
    }

    /**
     * @param {PLRgbImage | PLYCbCrImage} plImage raw data coming from native camera
     * @param {number} elapsedTime time in ms elapsed to get the raw frame
     */
    _onFrameGrabbed(plImage, elapsedTime) {
        var pSizeText = "";
        if (this.cameraProps.usingMJPEG === false) {
            pSizeText = `, p(${this.cameraProps.previewWidth}x${this.cameraProps.previewHeight}), p FPS:${this.cameraProps.targetPreviewFPS}`;
        }
        let rawframeLengthMB = undefined
        if (plImage instanceof PLRgbImage) {
            rawframeLengthMB = Math.round(10 * plImage.arrayBuffer.byteLength / 1024 / 1024) / 10;
            placeUint8RGBArrayInCanvas(this.__canvas, new Uint8Array(plImage.arrayBuffer), plImage.width, plImage.height);
        } else if (plImage instanceof PLYCbCrImage) {
            rawframeLengthMB = Math.round(10 * (plImage.yArrayBuffer.byteLength + plImage.cbCrArrayBuffer.byteLength) / 1024 / 1024) / 10;
            placeUint8GrayScaleArrayInCanvas(this.__canvas, new Uint8Array(plImage.yArrayBuffer), plImage.width, plImage.height);
            // placeUint8CbCrArrayInCanvas(this.cameraProps.rawCropCbCanvas, this.cameraProps.rawCropCrCanvas, new Uint8Array(plImage.cbCrArrayBuffer), plImage.width / 2, plImage.height / 2);
            // this.show(this.cameraProps.rawCropCbCanvas);
            // this.show(this.cameraProps.rawCropCrCanvas);
        } else {
            rawframeLengthMB = -1
        }

        this._updateStatus(`${this.cameraProps.selectedPresetName}${pSizeText}, raw FPS:${this.cameraProps.targetRawFPS}<br/> raw frame length: ${rawframeLengthMB}MB, ${plImage.width}x${plImage.height}`);

        if (this.cameraProps.rawFramesCounter !== 0 && this.cameraProps.rawFramesCounter % (this.cameraProps.fpsMeasurementInterval - 1) === 0) {
            this.cameraProps.rawFramesMeasuredFPS = 1000 / this.cameraProps.rawFramesElapsedSum * this.cameraProps.fpsMeasurementInterval;
            this.cameraProps.rawFramesCounter = 0;
            this.cameraProps.rawFramesElapsedSum = 0;
        } else {
            this.cameraProps.rawFramesCounter += 1;
            this.cameraProps.rawFramesElapsedSum += elapsedTime;
        }

        this._updateStatus(`raw ${Math.round(elapsedTime)} ms (max FPS=${Math.round(this.cameraProps.rawFramesMeasuredFPS)})`);
    }

    _onPictureTaken(base64ImageData) {
        this.__canvas.src = base64ImageData;
        this._updateStatus("New Picture taken");
    }

    _onCameraInitializedCallBack() {
        this.cameraProps.streamPreview.src = `${this.cameraProps._serverUrl}/mjpeg`;
        this._updateStatus("Camera Initialized");
    }

    _updateStatus(message){
        this._status = message;
        if (this.__statusHandler)
            this.__statusHandler(message);
    }

    _setupGLView(w, h){
        this.__scene = new THREE.Scene();
        this.__camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 10000);
        this.__renderer = new THREE.WebGLRenderer({ canvas: this.__canvas, antialias: true });

        let cameraHeight = h / 2 / Math.tan(this.__camera.fov / 2 * (Math.PI / 180));
        this.__camera.position.set(0, 0, cameraHeight);
        let clientHeight = Math.round(h / w * this.__canvas.clientWidth);
        this.__renderer.setSize(this.__canvas.clientWidth, clientHeight);

        const controls = new THREE.OrbitControls(this.__camera, this.__renderer.domElement);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.enableRotate = false;
        const dataTexture = new Uint8Array(w * h * this.cameraProps.bytePerChannel);
        for (let i = 0; i < w * h * this.cameraProps.bytePerChannel; i++)
            dataTexture[i] = 255;
        const frameTexture = new THREE.DataTexture(dataTexture, w, h, this.cameraProps.formatTexture, THREE.UnsignedByteType);
        frameTexture.needsUpdate = true;
        const planeGeo = new THREE.PlaneBufferGeometry(w, h);
        this.__material = new THREE.MeshBasicMaterial({
            map: frameTexture,
        });

        this.__material.map.flipY = true;
        const plane = new THREE.Mesh(planeGeo, this.__material);
        this.__scene.add(plane);
        this._animate();
    }

    async isAvailable(){
        return true;
    }

    async getConstraints(...args){
        const config = await getCameraConfiguration(this.cameraProps);
        return config;
    }

    async bindStreamToElement(canvas, cfg){
        if (!cfg)
            return this._startNativeCamera();
        if (!cfg.mode)
            cfg = Object.assign( {mode: MODE.GL}, cfg);
        this.__canvas = canvas;
        const {_x, _y, _w, _h} = this.cameraProps;
        this.setCrop(_x, _y, _w, _h);
        const config = new PLCameraConfig(this.cameraProps.selectedPresetName, this.cameraProps.flashMode, this.cameraProps.afOn, true, this.cameraProps.selectedDevicesNames, this.cameraProps.selectedCamera, true, this.cameraProps.selectedColorspace, parseFloat(this.cameraProps.torchRange.value));
        const isGL = cfg.mode === MODE.GL;
        if (isGL)
            this._setupGLView(this.cameraProps.previewWidth, this.cameraProps.previewHeight);
        startNativeCameraWithConfig(
            this.cameraProps,
            config,
            undefined,
            cfg.targetPreviewFPS ||this.cameraProps.targetPreviewFPS,
            cfg.previewWidth || this.cameraProps.previewWidth,
            isGl ? this._onFramePreview.name : this._onFrameGrabbed.name,
            cfg.targetRawFPS || this.cameraProps.targetRawFPS,
            isGl ? this._onFrameGrabbed.name : this._onCameraInitializedCallBack.name,
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
        stopNativeCamera(this.cameraProps);
        this._updateStatus("Camera Stopped");
    }

    switchCamera(...args){
        if (this.cameraProps.selectedCamera === "back") {
            this.cameraProps.selectedCamera = "front";
            this._updateStatus("Front Cam");
            return "front";
        } else {
            this.cameraProps.selectedCamera = "back";
            this._updateStatus("Back Cam");
            return "back";
        }
    }

    /**
     *
     * @param {function(string): void} [handler] when not provided, will return the current status.
     * Otherwise handler will be called on status update
     * @returns {*}
     */
    getStatus(handler){
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
                takePictureBase64NativeCamera(this._onPictureTaken.name);
                break;
            case MODE.MJPEG:
                await getSnapshot(this.cameraProps).then(b => this._onPictureTaken(URL.createObjectURL(b)))
        }
    }

    toggleTorch(){
        switch (this.cameraProps.flashMode) {
            case 'off':
                this.cameraProps.flashMode = 'flash';
                break;
            case 'flash':
                this.cameraProps.flashMode = 'torch';
                break;
            case 'torch':
                this.cameraProps.flashMode = 'off';
                break;
            default:
                break;
        }
        setFlashModeNativeCamera(this.cameraProps.flashMode);
        this._updateStatus(`FLASH MODE: ${this.cameraProps.flashMode}`);
        return this.cameraProps.flashMode;
    }

    setTorchLevel(level){
        setTorchLevelNativeCamera(level);
        this._updateStatus(`Torch Level: ${level}`);
    }

    setColorSpace(nextColorSpace){
        setPreferredColorSpaceNativeCamera(nextColorSpace);
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
        setRawCropRoi(this.cameraProps, x, y, w, h);
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
            getCameraStream: false
        });
    }
}

module.exports = {
    CameraApi
}