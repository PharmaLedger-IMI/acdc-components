const threeLib = require('./lib/three.min');
const orbitLib = require('./lib/OrbitControls');
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
            isGl ? "onFramePreview" : "onFrameGrabbed",
            cfg.targetRawFPS || this.cameraProps.targetRawFPS,
            isGl ? "onFrameGrabbed" : "onCameraInitializedCallBack",
            _x,
            _y,
            _w,
            _h,
            cfg.ycbcrCheck);
    }

    async getCameraStream(...args){
        throw new Error(`Not implemented`);
    }

    _onPictureTaken(base64ImageData) {
        this.__canvas.src = base64ImageData;
    }

    async takePicture(mode = MODE.GL){
        switch(mode){
            case MODE.GL:
                return takePictureBase64NativeCamera("_onPictureTaken");
            case MODE.MJPEG:
                return getSnapshot(this.cameraProps).then(b => this._onPictureTaken(URL.createObjectURL(b)))
        }
    }

    closeCameraStream(){
        stopNativeCamera(this.cameraProps);
    }

    switchCamera(...args){
        if (this.cameraProps.selectedCamera === "back") {
            this.cameraProps.selectedCamera = "front";
            return "front";
        } else {
            this.cameraProps.selectedCamera = "back";
            this.cameraProps.selectCameraButton.innerHTML = "Back Cam";
            return "back";
        }
    }

    getStatus(...args){
        throw new Error(`Not implemented`);
    }

    hasPermissions(...args){
        throw new Error(`Not implemented`);
    }

    onCameraInitializedCallBack() {
        this.cameraProps.streamPreview.src = `${this.cameraProps._serverUrl}/mjpeg`;
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
        return this.cameraProps.flashMode;
    }

    setTorchLevel(level){
        setTorchLevelNativeCamera(level);
    }

    setColorSpace(nextColorSpace){
        setPreferredColorSpaceNativeCamera(nextColorSpace);
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
            return false;
        } else {
            this.cameraProps.afOn = true;
            return true;
        }
    }

    getDeviceTypes(){
        return deviceTypeNames;
    }

}

module.exports = {
    CameraApi
}