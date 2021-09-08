const {WebcController} = WebCardinal.controllers;
const {constants, THREE, PLCameraConfig} = window.Native.Camera;

export default class NativeController extends WebcController{
    elements = {};

    _bindElements(){
        this.elements.status_test = this.element.querySelector('#status_test');
        this.elements.status_fps_preview = this.element.querySelector('#status_fps_preview');
        this.elements.status_fps_raw = this.element.querySelector('#status_fps_raw');
        this.elements.startCameraButtonGL = this.element.querySelector('#startCameraButtonGL');
        this.elements.startCameraButtonMJPEG = this.element.querySelector('#startCameraButtonMJPEG');
        this.elements.stopCameraButton = this.element.querySelector('#stopCameraButton');
        this.elements.stopCameraButton.disabled = true

        this.elements.takePictureButton1 = this.element.querySelector('#takePictureButton1');
        this.elements.takePictureButton2 = this.element.querySelector('#takePictureButton2');
        this.elements.flashButton = this.element.querySelector('#flashButton');
        this.elements.torchLevelRangeLabel = this.element.querySelector('#torchLevelRangeLabel');
        this.elements.torchRange = this.element.querySelector('#torchLevelRange');
        this.elements.snapshotImage = this.element.querySelector('#snapshotImage');
        this.elements.getConfigButton = this.element.querySelector('#getConfigButton');
        this.elements.configInfo = this.element.querySelector('#configInfo');
        this.elements.colorspaceButton = this.element.querySelector('#colorspaceButton');
        this.elements.continuousAFButton = this.element.querySelector("#continuousAFButton");
        this.elements.canvasgl = this.element.querySelector('#cameraCanvas');
        this.elements.streamPreview = this.element.querySelector('#streamPreview');
        this.elements.rawCropCanvas = this.element.querySelector('#rawCropCanvas');
        this.elements.rawCropCbCanvas = this.element.querySelector('#rawCropCbCanvas');
        this.elements.rawCropCrCanvas = this.element.querySelector('#rawCropCrCanvas');
        this.elements.invertRawFrameCheck = this.element.querySelector('#invertRawFrameCheck');
        this.elements.cropRawFrameCheck = this.element.querySelector('#cropRawFrameCheck');
        this.elements.ycbcrCheck = this.element.querySelector('#ycbcrCheck');
        this.elements.rawCropRoiInput = this.element.querySelector('#rawCropRoiInput');
        this.elements.selectCameraButton = this.element.querySelector("#selectCameraButton");
        this.elements.select_preset = this.element.querySelector('#select_preset');
        this.elements.select_cameras = this.element.querySelector('#select_cameras');

    }

    _bindListeners(){
        this.elements.torchRange.addEventListener('change', this.setTorchlevel.bind(this));
        this.elements.getConfigButton.addEventListener("click", this.getCameraConfigs.bind(this));
        this.elements.colorspaceButton.addEventListener('click', this.toggleColorSpace.bind(this));
        this.elements.continuousAFButton.addEventListener('click', this.toggleContinuousAF.bind(this));
        this.elements.selectCameraButton.addEventListener('click', this.switchCamera.bind(this));
        this.elements.rawCropRoiInput.addEventListener("change", this.setCropCoords.bind(this));
        this.elements.cropRawFrameCheck.addEventListener("change", this.toggleCrop.bind(this));
        this.elements.startCameraButtonGL.addEventListener('click', async (e) => {
            await this.startCamera('gl');
        });
        this.elements.startCameraButtonMJPEG.addEventListener('click', async (e) => {
            await this.startCamera('mjpeg');
        });
        this.elements.stopCameraButton.addEventListener('click', this.stopCamera.bind(this));
        this.elements.takePictureButton1.addEventListener('click', async () => {
            await this.takePicture();
        });
        this.elements.takePictureButton2.addEventListener('click', async  () => {
            await this.takePicture("mjpeg");
        });
        this.elements.flashButton.addEventListener('click', this.toggleTorch.bind(this));
        this.onTagEvent('cycleCameras', 'change', this.changeDesiredCamerasList.bind(this))
    }

    _initializeValues(){
        this.elements.torchRange.value = "1.0";
        this.elements.torchLevelRangeLabel.innerHTML = `Torch Level: ${this.elements.torchRange.value}`;
        this.renderer = undefined;
        this.camera = undefined;
        this.scene = undefined;
        this.material = undefined;
        this.previewWidth = 360;
        this.previewHeight = Math.round(this.previewWidth * 16 / 9); // assume 16:9 portrait at start
        this.targetPreviewFPS = 25;
        this.fpsMeasurementInterval = 5;
        this.previewFramesCounter = 0;
        this.previewFramesElapsedSum = 0;
        this.previewFramesMeasuredFPS = 0;
        this.targetRawFPS = 10;

        this.rawCrop_x = undefined;
        this.rawCrop_y = undefined;
        this.rawCrop_w = undefined;
        this.rawCrop_h = undefined;
        this.rawFramesCounter = 0;
        this.rawFramesElapsedSum = 0;
        this.rawFramesMeasuredFPS = 0;
        this.controls = undefined;

        const presetNames = this.Camera.getCapabilities().sessionPresetNames
        if (presetNames){
            let i = 0;
            for (let presetName of presetNames) {
                var p_i = new Option(presetName, presetName)
                // @ts-ignore
                this.elements.select_preset.options.add(p_i);
                i++;
            }
            for (let i = 0; i < this.elements.select_preset.options.length; i++) {
                if (this.elements.select_preset.options[i].value === 'hd1920x1080') {
                    this.elements.select_preset.selectedIndex = i;
                    break;
                }
            }
        }

        const selected = this.elements.select_preset.options[this.elements.select_preset.selectedIndex].value;

        this.Camera.selectPreset(selected);
        this.elements.status_test.innerHTML = selected;
        // hardcoded cameras list
        for (let deviceTypeName of this.Camera.getDeviceTypes())
            this.elements.select_cameras.options.add(new Option(deviceTypeName, deviceTypeName));

        this.elements.select_cameras.selectedIndex = 0;
    }

    constructor(element, history) {
        super(element, history);
        this.setModel({
            data: '',
            hasCode: false,
            hasError: false,
            nativeSupport: false,
            useScandit: false
        });

        this.Camera = window.Native.Camera;
        this.Camera.registerHandlers(
            this.onFramePreview.bind(this),
            this.onFrameGrabbed.bind(this),
            this.onPictureTaken.bind(this)
        )
        this._bindElements();
        this._initializeValues();
        this._bindListeners();

        this.hide(this.elements.rawCropRoiInput);
        this.hide(this.elements.rawCropCanvas);
        this.hide(this.elements.rawCropCbCanvas);
        this.hide(this.elements.rawCropCrCanvas);

        this.hide(this.elements.canvasgl);
        this.hide(this.elements.streamPreview);
        this.hide(this.elements.status_fps_preview);
        this.hide(this.elements.status_fps_raw);
    }

    changeDesiredCamerasList() {
        for (let i = 0; i < this.elements.select_cameras.options.length; i++) {
            if (this.elements.select_cameras.options[i].selected) {
                this.elements.selectedDevicesNames.push(this.elements.select_cameras.options[i].value);
            }
        }
    }

    async startCamera(mode){
        let onFramePreviewCallback = undefined;
        let self = this;
        let onCameraInitializedCallback = () => {
            self.elements.streamPreview.src = `${self._serverUrl}/mjpeg`;
        }
        switch(mode){
            case 'gl':
                this.usingMJPEG = false;
                this.elements.select_preset.disabled = true;
                this.elements.startCameraButtonGL.disabled = true
                this.elements.startCameraButtonMJPEG.disabled = true
                this.elements.stopCameraButton.disabled = false
                this.elements.ycbcrCheck.disabled = true
                this.elements.continuousAFButton.disabled = true
                this.elements.selectCameraButton.disabled = true
                this.elements.select_cameras.disabled = true
                this.show(this.elements.canvasgl);
                this.elements.canvasgl.parentElement.style.display = "block";
                this.hide(this.elements.streamPreview);
                this.elements.streamPreview.parentElement.style.display = "none";
                this.show(this.elements.status_fps_preview);
                this.show(this.elements.status_fps_raw);
                this.setCropCoords();
                this.setupGLView(this.previewWidth, this.previewHeight);
                onFramePreviewCallback = this.onFramePreview.bind(this);
                onCameraInitializedCallback = () => console.log('camera initialized');
                break;
            default:
                this.usingMJPEG = true;
                this.elements.select_preset.disabled = true;
                this.elements.startCameraButtonGL.disabled = true
                this.elements.startCameraButtonMJPEG.disabled = true
                this.elements.stopCameraButton.disabled = false
                this.elements.ycbcrCheck.disabled = true
                this.elements.continuousAFButton.disabled = true
                this.elements.selectCameraButton.disabled = true
                this.elements.select_cameras.disabled = true
                this.hide(this.elements.canvasgl);
                this.elements.canvasgl.parentElement.style.display = "block";
                this.show(this.elements.streamPreview);
                this.elements.streamPreview.parentElement.style.display = "block";
                this.hide(this.elements.status_fps_preview);
                this.show(this.elements.status_fps_raw);
                this.setCropCoords();
        }


        const config = new PLCameraConfig(this.Camera.cameraProps.selectedPresetName,
            this.Camera.cameraProps.flashMode, this.Camera.cameraProps.afOn, true,
            this.Camera.cameraProps.selectedDevicesNames, this.Camera.cameraProps.selectedCamera,
            true, this.Camera.cameraProps.selectedColorspace,
            parseFloat(this.elements.torchRange.value));

        this.Camera.nativeBridge.startNativeCameraWithConfig(
            config,
            onFramePreviewCallback,
            this.targetPreviewFPS,
            this.previewWidth,
            this.onFrameGrabbed.bind(this),
            this.targetRawFPS,
            () => {
                this.elements.streamPreview.src = `${this.Camera.cameraProps._serverUrl}/mjpeg`;
            },
            this.rawCrop_x,
            this.rawCrop_y,
            this.rawCrop_w,
            this.rawCrop_h,
            this.elements.ycbcrCheck.checked);
    }

    stopCamera(){
        window.close();
        this.Camera.closeCameraStream();
        this.elements.select_preset.disabled = false;
        this.elements.startCameraButtonGL.disabled = false
        this.elements.startCameraButtonMJPEG.disabled = false
        this.elements.stopCameraButton.disabled = true
        this.elements.ycbcrCheck.disabled = false
        this.elements.continuousAFButton.disabled = false
        this.elements.selectCameraButton.disabled = false
        this.elements.select_cameras.disabled = false
    }

    async takePicture(mode){
        await this.Camera.takePicture(mode);
    }

    toggleTorch(){
        const newMode = this.Camera.toggleTorch();
        switch (newMode) {
            case 'flash':
                this.elements.torchRange.disabled = false;
                break;
            case 'torch':
                this.elements.torchRange.disabled = true;
                break;
            default:
                break;
        }
        this.elements.flashButton.innerHTML = this.Camera.getStatus();
    }

    setTorchlevel(){
        let level = parseFloat(this.elements.torchRange.value);
        if (level === undefined) {
            alert('failed to parse torch level value');
        } else {
            this.Camera.setTorchLevel(level);
            this.elements.torchLevelRangeLabel.innerHTML = this.Camera.getStatus();
        }
    }

    toggleCrop(){
        if (this.elements.cropRawFrameCheck.checked) {
            this.show(this.elements.rawCropRoiInput);
        } else {
            this.hide(this.elements.rawCropRoiInput);
        }
    }

    setCropCoords(){
        let rawCrop_x, rawCrop_y, rawCrop_w, rawCrop_h;
        if (this.elements.cropRawFrameCheck.checked) {

            const coords = this.elements.rawCropRoiInput.value.split(",");
            rawCrop_x = parseInt(coords[0]);
            rawCrop_y = parseInt(coords[1]);
            rawCrop_w = parseInt(coords[2]);
            rawCrop_h = parseInt(coords[3]);
            if (rawCrop_x != rawCrop_x || rawCrop_y != rawCrop_y || rawCrop_w != rawCrop_w || rawCrop_h != rawCrop_h) {
                alert("failed to parse coords");
                this.elements.cropRawFrameCheck.checked = false;
                hide(this.elements.rawCropRoiInput);
                rawCrop_x = undefined;
                rawCrop_y = undefined;
                rawCrop_w = undefined;
                rawCrop_h = undefined;
            }
            this.Camera.cameraProps.cropRawFrameCheck = true;
        } else {
            rawCrop_x = undefined;
            rawCrop_y = undefined;
            rawCrop_w = undefined;
            rawCrop_h = undefined;
            this.Camera.cameraProps.cropRawFrameCheck = false;
        }
        this.Camera.setCrop(rawCrop_x, rawCrop_y, rawCrop_w, rawCrop_h);
    }

    switchCamera(){
        this.Camera.switchCamera()
        this.elements.selectCameraButton.innerHTML = this.Camera.getStatus();
    }

    toggleContinuousAF(){
        this.Camera.toggleContinuousAF()
        this.elements.continuousAFButton.innerHTML = this.Camera.getStatus();
    }

    toggleColorSpace(){
        let nextColorspace = '';
        switch (this.elements.colorspaceButton.innerHTML) {
            case constants.colorSpaces.sRGB:
                nextColorspace = constants.colorSpaces.HLG_BT2020;
                break;
            case constants.colorSpaces.HLG_BT2020:
                nextColorspace = constants.colorSpaces.P3_D65;
                break;
            default:
                nextColorspace = constants.colorSpaces.sRGB;
                break;
        }
        this.Camera.setColorSpace(nextColorspace);
        this.elements.colorspaceButton.innerHTML = this.Camera.getStatus();
    }

    getCameraConfigs(){
        this.Camera.getConstraints()
            .then(data => {
                this.elements.configInfo.innerHTML = JSON.stringify(data);
            })
    }

    ChangePresetList() {
        let selectedPresetName = this.elements.select_preset.options[this.elements.select_preset.selectedIndex].value;
        this.elements.status_test.innerHTML = selectedPresetName;
        this.Camera.selectPreset(selectedPresetName);
    }

    hide(element) {
        element.style.display = "none";
    }

    show(element) {
        element.style.display = "block";
    }

    setupGLView(w, h) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.elements.canvasgl, antialias: true });

        let cameraHeight = h/2/Math.tan(this.camera.fov/2*(Math.PI/180))
        this.camera.position.set(0,0,cameraHeight);
        let clientHeight = Math.round(h/w * this.elements.canvasgl.clientWidth);
        this.renderer.setSize(this.elements.canvasgl.clientWidth, clientHeight);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        this.controls.enableRotate = false;

        const {bytePerChannel, formatTexture} = this.Camera.cameraProps;

        const dataTexture = new Uint8Array(w * h * bytePerChannel);
        for (let i=0; i < w * h * bytePerChannel; i++)
            dataTexture[i] = 255;
        const frameTexture = new THREE.DataTexture(dataTexture, w, h, formatTexture, THREE.UnsignedByteType);
        frameTexture.needsUpdate = true;
        const planeGeo = new THREE.PlaneBufferGeometry(w, h);
        this.material = new THREE.MeshBasicMaterial({
            map: frameTexture,
        });
        this.material.map.flipY = true;
        const plane = new THREE.Mesh(planeGeo, this.material);
        this.scene.add(plane);

        this.animate();
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * @param {PLRgbImage} rgbImage preview data coming from native camera
     * @param {number} elapsedTime time in ms elapsed to get the preview frame
     */
    onFramePreview(rgbImage, elapsedTime) {
        const {formatTexture} = this.Camera.cameraProps;
        let frame = new Uint8Array(rgbImage.arrayBuffer);
        if (rgbImage.width !== this.previewWidth || rgbImage.height !== this.previewHeight) {
            this.previewWidth = rgbImage.width;
            this.previewHeight = rgbImage.height;
            this.setupGLView(this.previewWidth, this.previewHeight);
        }
        this.material.map = new THREE.DataTexture(frame, rgbImage.width, rgbImage.height, formatTexture, THREE.UnsignedByteType);
        this.material.map.flipY = true;
        this.material.needsUpdate = true;

        if (this.elements.previewFramesCounter !== 0 && this.previewFramesCounter%(this.fpsMeasurementInterval-1) === 0) {
            this.previewFramesMeasuredFPS = 1000/this.previewFramesElapsedSum * this.fpsMeasurementInterval;
            this.previewFramesCounter = 0;
            this.previewFramesElapsedSum = 0;
        } else {
            this.previewFramesCounter += 1;
            this.previewFramesElapsedSum += elapsedTime;
        }
        this.elements.status_fps_preview.innerHTML = `preview ${Math.round(elapsedTime)} ms (max FPS=${Math.round(this.previewFramesMeasuredFPS)})`;
    }

    /**
     * @param {PLRgbImage | PLYCbCrImage} plImage raw data coming from native camera
     * @param {number} elapsedTime time in ms elapsed to get the raw frame
     */
    onFrameGrabbed(plImage, elapsedTime) {
        let pSizeText = "";
        if (this.usingMJPEG === false) {
            pSizeText = `, p(${this.previewWidth}x${this.previewHeight}), p FPS:${this.targetPreviewFPS}`
        }

        const {PLRgbImage, PLYCbCrImage} = this.Camera.imageTypes;

        let rawframeLengthMB = undefined
        if (plImage instanceof PLRgbImage) {
            rawframeLengthMB = Math.round(10*plImage.arrayBuffer.byteLength/1024/1024)/10;
            this.Camera.nativeBridge.placeUint8RGBArrayInCanvas(this.elements.rawCropCanvas, this.elements.invertRawFrameCheck.checked === true, new Uint8Array(plImage.arrayBuffer), plImage.width, plImage.height);
            this.show(this.elements.rawCropCanvas);
            this.hide(this.elements.rawCropCbCanvas);
            this.hide(this.elements.rawCropCrCanvas);
        } else if (plImage instanceof PLYCbCrImage) {
            rawframeLengthMB = Math.round(10*(plImage.yArrayBuffer.byteLength + plImage.cbCrArrayBuffer.byteLength)/1024/1024)/10;
            this.Camera.nativeBridge.placeUint8GrayScaleArrayInCanvas(this.elements.rawCropCanvas, this.elements.invertRawFrameCheck.checked === true, new Uint8Array(plImage.yArrayBuffer), plImage.width, plImage.height);
            this.show(this.elements.rawCropCanvas);
            this.Camera.nativeBridge.placeUint8CbCrArrayInCanvas(this.elements.rawCropCbCanvas, this.elements.rawCropCrCanvas, new Uint8Array(plImage.cbCrArrayBuffer), plImage.width/2, plImage.height/2);
            this.show(this.elements.rawCropCbCanvas);
            this.show(this.elements.rawCropCrCanvas);
        } else {
            rawframeLengthMB = -1;
        }

        this.elements.status_test.innerHTML = `${this.selectedPresetName}${pSizeText}, raw FPS:${this.targetRawFPS}<br/> raw frame length: ${rawframeLengthMB}MB, ${plImage.width}x${plImage.height}`

        if (this.rawFramesCounter !== 0 && this.rawFramesCounter%(this.fpsMeasurementInterval-1) === 0) {
            this.rawFramesMeasuredFPS = 1000/this.rawFramesElapsedSum * this.fpsMeasurementInterval;
            this.rawFramesCounter = 0;
            this.rawFramesElapsedSum = 0;
        } else {
            this.rawFramesCounter += 1;
            this.rawFramesElapsedSum += elapsedTime;
        }
        this.elements.status_fps_raw.innerHTML = `raw ${Math.round(elapsedTime)} ms (max FPS=${Math.round(this.rawFramesMeasuredFPS)})`
    }

    onPictureTaken(base64ImageData) {
        console.log(`Inside onPictureTaken`)
        this.elements.snapshotImage.src = base64ImageData
    }
}
