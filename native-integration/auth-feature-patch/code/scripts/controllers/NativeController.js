const {WebcController} = WebCardinal.controllers;

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
        this.elements.torchRange.addEventListener('change', () => {
            let level = parseFloat(this.elements.torchRange.value);
            if (level === undefined) {
                alert('failed to parse torch level value');
            } else {
                this.Camera.setTorchLevel(level);
                this.elements.torchLevelRangeLabel.innerHTML = `Torch Level: ${this.elements.torchRange.value}`;
            }
        });
        this.elements.getConfigButton.addEventListener("click", (e) => {
            this.Camera.getConstraints()
                .then(data => {
                    this.elements.configInfo.innerHTML = JSON.stringify(data);
                })
        });
        this.elements.colorspaceButton.addEventListener('click', (e) => {
            let nextColorspace = '';
            switch (this.elements.colorspaceButton.innerHTML) {
                case 'sRGB':
                    nextColorspace = 'HLG_BT2020';
                    break;
                case 'HLG_BT2020':
                    nextColorspace = 'P3_D65';
                    break;
                default:
                    nextColorspace = 'sRGB';
                    break;
            }
            this.elements.colorspaceButton.innerHTML = nextColorspace;
            this.Camera.setColorSpace(nextColorspace);
        });
        this.elements.continuousAFButton.addEventListener('click', (e) => {
            this.elements.continuousAFButton.innerHTML = `AF ${this.Camera.toggleContinuousAF() ? "ON" : "OFF"}`
        });
        this.elements.selectCameraButton.addEventListener('click', (e) => {
            this.elements.selectCameraButton.innerHTML = `${this.Camera.switchCamera() === 'front' ? "Front" : "Back"} Cam`;
        });
        this.elements.rawCropRoiInput.addEventListener("change", () => {
            this.setCropCoords();
        });
        this.elements.cropRawFrameCheck.addEventListener("change", () => {
            if (this.checked) {
                this.show(this.cameraProps.rawCropRoiInput);
            } else {
                this.hide(this.cameraProps.rawCropRoiInput);
            }
        });
        this.elements.startCameraButtonGL.addEventListener('click', async (e) => {
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
            await this.Camera.bindStreamToElement(this.elements.canvasgl,{ycbcrCheck: this.elements.ycbcrCheck.value});
        });
        this.elements.startCameraButtonMJPEG.addEventListener('click', async (e) => {
            this.elements.select_preset.disabled = true;
            this.elements.startCameraButtonGL.disabled = true
            this.elements.startCameraButtonMJPEG.disabled = true
            this.elements.stopCameraButton.disabled = false
            this.elements.ycbcrCheck.disabled = true
            this.elements.continuousAFButton.disabled = true
            this.elements.selectCameraButton.disabled = true
            this.elements.select_cameras.disabled = true
            this.hide(this.elements.canvasgl);
            this.elements.canvasgl.parentElement.style.display = "none";
            this.show(this.elements.streamPreview);
            this.elements.streamPreview.parentElement.style.display = "block";
            this.hide(this.elements.status_fps_preview);
            this.show(this.elements.status_fps_raw);
            await this.Camera.bindStreamToElement(this.elements.streamPreview, {mode: "mjpeg", ycbcrCheck: this.elements.ycbcrCheck.value});
        });
        this.elements.stopCameraButton.addEventListener('click', () => {
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
        });
        this.elements.takePictureButton1.addEventListener('click', async () => {
            await this.Camera.takePicture();
        });
        this.elements.takePictureButton2.addEventListener('click', async  () => {
            await this.Camera.takePicture("mjpeg");
        });
        this.elements.flashButton.addEventListener('click', () => {
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
            this.elements.flashButton.innerHTML = `T ${newMode}`;
        });
    }
    
    _initializeValues(){
        this.elements.torchRange.value = "1.0";
        this.elements.torchLevelRangeLabel.innerHTML = `Torch Level: ${this.elements.torchRange.value}`;
        let i = 0
        for (let presetName of sessionPresetNames) {
            var p_i = new Option(presetName, presetName)
            // @ts-ignore
            this.elements.select_preset.options.add(p_i);
            i++;
        }
        for (let i = 0; i < this.cameraProps.elements.options.length; i++) {
            if (this.cameraProps.elements.options[i].value === 'hd1920x1080') {
                this.cameraProps.elements.selectedIndex = i;
                break;
            }
        }
        this.cameraProps.selectedPresetName = this.elements.select_preset.options[this.elements.select_preset.selectedIndex].value;
        this.elements.status_test.innerHTML = this.cameraProps.selectedPresetName;
        // hardcoded cameras list
        for (let deviceTypeName of this.Camera.getDeviceTypes()) {
            // @ts-ignore
            this.elements.select_cameras.options.add(new Option(deviceTypeName, deviceTypeName));
        }
        this.elements.select_cameras.selectedIndex = 0;
        this.cameraProps.selectedDevicesNames = [this.Camera.getDeviceTypes()[0]]
        
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
        this._bindElements();
        this._initializeValues();
        this._bindListeners();

        this.hide(this.elements.rawCropRoiInput);
        this.hide(this.elements.rawCropCanvas);
        this.hide(this.elements.rawCropCbCanvas);
        this.hide(this.elements.rawCropCrCanvas);

        this.hide(this.cameraProps.canvasgl);
        this.hide(this.cameraProps.streamPreview);
        this.hide(this.cameraProps.status_fps_preview);
        this.hide(this.cameraProps.status_fps_raw);
    }

    ChangeDesiredCamerasList() {
        this.cameraProps.selectedDevicesNames = [];
        for (let i = 0; i < this.cameraProps.select_cameras.options.length; i++) {
            if (this.cameraProps.select_cameras.options[i].selected) {
                this.cameraProps.selectedDevicesNames.push(this.cameraProps.select_cameras.options[i].value);
            }
        }
    }

    ChangePresetList() {
        let selectedPresetName = this.cameraProps.select_preset.options[this.cameraProps.select_preset.selectedIndex].value;
        this.cameraProps.status_test.innerHTML = selectedPresetName;
    }

    setCropCoords() {
        let rawCrop = {
            x: undefined,
            y: undefined,
            w: undefined,
            h: undefined
        }
        
        let result = Object.assign({}, rawCrop);
        if (this.elements.cropRawFrameCheck.checked) {
            const coords = this.elements.rawCropRoiInput.value.split(",");
            let rawCrop = {
                x: parseInt(coords[0]),
                y: parseInt(coords[1]),
                w: parseInt(coords[2]),
                h: parseInt(coords[3])
            }
           
            if (!Object.keys(rawCrop).every(k => rawCrop[k] !== undefined)) {
                alert("failed to parse coords");
                this.elements.cropRawFrameCheck.checked = false;
                
                this.hide(this.elements.rawCropRoiInput);
                
                result = rawCrop;
            }
        } else {
            result = rawCrop;
        }
        this.Camera.setCrop(result.x, result.y, result.w, result.h);
    }

    /**
     * @param {PLRgbImage | PLYCbCrImage} plImage raw data coming from native camera
     * @param {number} elapsedTime time in ms elapsed to get the raw frame
     */
    onFrameGrabbed(plImage, elapsedTime) {
        var pSizeText = "";
        if (this.cameraProps.usingMJPEG === false) {
            pSizeText = `, p(${this.cameraProps.previewWidth}x${this.cameraProps.previewHeight}), p FPS:${this.cameraProps.targetPreviewFPS}`;
        }
        let rawframeLengthMB = undefined
        if (plImage instanceof PLRgbImage) {
            rawframeLengthMB = Math.round(10 * plImage.arrayBuffer.byteLength / 1024 / 1024) / 10;
            this.placeUint8RGBArrayInCanvas(rawCropCanvas, new Uint8Array(plImage.arrayBuffer), plImage.width, plImage.height);
            this.show(this.cameraProps.rawCropCanvas);
            this.hide(this.cameraProps.rawCropCbCanvas);
            this.hide(this.cameraProps.rawCropCrCanvas);
        } else if (plImage instanceof PLYCbCrImage) {
            rawframeLengthMB = Math.round(10 * (plImage.yArrayBuffer.byteLength + plImage.cbCrArrayBuffer.byteLength) / 1024 / 1024) / 10;
            this.placeUint8GrayScaleArrayInCanvas(this.cameraProps.rawCropCanvas, new Uint8Array(plImage.yArrayBuffer), plImage.width, plImage.height);
            this.show(this.cameraProps.rawCropCanvas);
            this.placeUint8CbCrArrayInCanvas(this.cameraProps.rawCropCbCanvas, this.cameraProps.rawCropCrCanvas, new Uint8Array(plImage.cbCrArrayBuffer), plImage.width / 2, plImage.height / 2);
            this.show(this.cameraProps.rawCropCbCanvas);
            this.show(this.cameraProps.rawCropCrCanvas);
        } else {
            rawframeLengthMB = -1
        }

        this.cameraProps.status_test.innerHTML = `${this.cameraProps.selectedPresetName}${pSizeText}, raw FPS:${this.cameraProps.targetRawFPS}<br/> raw frame length: ${rawframeLengthMB}MB, ${plImage.width}x${plImage.height}`

        if (this.cameraProps.rawFramesCounter !== 0 && this.cameraProps.rawFramesCounter % (this.cameraProps.fpsMeasurementInterval - 1) === 0) {
            this.cameraProps.rawFramesMeasuredFPS = 1000 / this.cameraProps.rawFramesElapsedSum * this.cameraProps.fpsMeasurementInterval;
            this.cameraProps.rawFramesCounter = 0;
            this.cameraProps.rawFramesElapsedSum = 0;
        } else {
            this.cameraProps.rawFramesCounter += 1;
            this.cameraProps.rawFramesElapsedSum += elapsedTime;
        }
        this.cameraProps.status_fps_raw.innerHTML = `raw ${Math.round(elapsedTime)} ms (max FPS=${Math.round(this.cameraProps.rawFramesMeasuredFPS)})`;
    }

    hide(element) {
        element.style.display = "none";
    }

    show(element) {
        element.style.display = "block";
    }

    placeUint8RGBArrayInCanvas(canvasElem, array, w, h) {
        let a = 1;
        let b = 0;
        if (this.cameraProps.invertRawFrameCheck.checked === true) {
            a = -1;
            b = 255;
        }
        canvasElem.width = w;
        canvasElem.height = h;
        var ctx = canvasElem.getContext('2d');
        var clampedArray = new Uint8ClampedArray(w * h * 4);
        let j = 0
        for (let i = 0; i < 3 * w * h; i += 3) {
            clampedArray[j] = b + a * array[i];
            clampedArray[j + 1] = b + a * array[i + 1];
            clampedArray[j + 2] = b + a * array[i + 2];
            clampedArray[j + 3] = 255;
            j += 4;
        }
        var imageData = new ImageData(clampedArray, w, h);
        ctx.putImageData(imageData, 0, 0);
    }

    placeUint8GrayScaleArrayInCanvas(canvasElem, array, w, h) {
        let a = 1;
        let b = 0;
        if (invertRawFrameCheck.checked === true) {
            a = -1;
            b = 255;
        }
        canvasElem.width = w;
        canvasElem.height = h;
        var ctx = canvasElem.getContext('2d');
        var clampedArray = new Uint8ClampedArray(w * h * 4);
        let j = 0
        for (let i = 0; i < w * h; i++) {
            clampedArray[j] = b + a * array[i];
            clampedArray[j + 1] = b + a * array[i];
            clampedArray[j + 2] = b + a * array[i];
            clampedArray[j + 3] = 255;
            j += 4;
        }
        var imageData = new ImageData(clampedArray, w, h);
        ctx.putImageData(imageData, 0, 0);
    }

    placeUint8CbCrArrayInCanvas(canvasElemCb, canvasElemCr, array, w, h) {
        canvasElemCb.width = w;
        canvasElemCb.height = h;
        canvasElemCr.width = w;
        canvasElemCr.height = h;
        var ctxCb = canvasElemCb.getContext('2d');
        var ctxCr = canvasElemCr.getContext('2d');
        var clampedArrayCb = new Uint8ClampedArray(w * h * 4);
        var clampedArrayCr = new Uint8ClampedArray(w * h * 4);
        let j = 0
        for (let i = 0; i < 2 * w * h; i += 2) {
            clampedArrayCb[j] = array[i];
            clampedArrayCb[j + 1] = array[i];
            clampedArrayCb[j + 2] = array[i];
            clampedArrayCb[j + 3] = 255;
            clampedArrayCr[j] = array[i + 1];
            clampedArrayCr[j + 1] = array[i + 1];
            clampedArrayCr[j + 2] = array[i + 1];
            clampedArrayCr[j + 3] = 255;
            j += 4;
        }
        var imageDataCb = new ImageData(clampedArrayCb, w, h);
        ctxCb.putImageData(imageDataCb, 0, 0);
        var imageDataCr = new ImageData(clampedArrayCr, w, h);
        ctxCr.putImageData(imageDataCr, 0, 0);
    }

    /**
     * Gets a raw RGB frame. A ROI can be specified, corresponds to endpoint /rawframe
     * @param  {number} [x=undefined]
     * @param  {number} [y=undefined]
     * @param  {number} [w=undefined]
     * @param  {number} [h=undefined]
     * @returns {Promise<void | PLRgbImage>} a raw RGB frame
     */
    getRawFrame(x = undefined, y = undefined, w = undefined, h = undefined) {
        let fetchString = `${this.cameraProps._serverUrl}/rawframe`;
        let params = {};
        if (x !== undefined) {
            params.x = x;
        }
        if (y !== undefined) {
            params.y = y;
        }
        if (w !== undefined) {
            params.w = w;
        }
        if (h !== undefined) {
            params.h = h;
        }
        if (Object.keys(params).length > 0) {
            // @ts-ignore
            const urlParams = new URLSearchParams(params);
            fetchString = `${fetchString}?${urlParams.toString()}`;
        }
        return fetch(fetchString)
            .then(response => {
                let image = this.getPLRgbImageFromResponse(response);
                return image;
            })
            .catch(error => {
                console.log(error);
            })
    }

    /** Get a raw YCbCr 420 frame A ROI can be specified, corresponds to endpoint /rawframe_ycbcr
     * @param  {number} [x=undefined]
     * @param  {number} [y=undefined]
     * @param  {number} [w=undefined]
     * @param  {number} [h=undefined]
     * @returns {Promise<Void | PLYCbCrImage>} a raw YCbCr frame
     */
    getRawFrameYCbCr(x = undefined, y = undefined, w = undefined, h = undefined) {
        let fetchString = `${this.cameraProps._serverUrl}/rawframe_ycbcr`;
        let params = {};
        if (x !== undefined) {
            params.x = x;
        }
        if (y !== undefined) {
            params.y = y;
        }
        if (w !== undefined) {
            params.w = w;
        }
        if (h !== undefined) {
            params.h = h;
        }
        if (Object.keys(params).length > 0) {
            // @ts-ignore
            const urlParams = new URLSearchParams(params);
            fetchString = `${fetchString}?${urlParams.toString()}`;
        }
        return fetch(fetchString)
            .then(response => {
                let image = this.getPLYCbCrImageFromResponse(response);
                return image;
            })
            .catch(error => {
                console.log(error);
            })
    }
    /**
     * Get the current camera configuration, corresponds to endpoint /cameraconfig
     * @returns {Promise<any>} the current camera configuration
     */
    getCameraConfiguration() {
        let fetchString = `${this.cameraProps._serverUrl}/cameraconfig`;
        return fetch(fetchString)
            .then(response => {
                return response.json()
            })
    }

    /**
     * Packs a response from endpoints providing raw rgb buffer as octet-stream and image size in headers
     *
     * @param  {Response} response
     * @returns {Promise<PLRgbImage>} the image in a promise
     */
    getPLRgbImageFromResponse(response) {
        let frame_w = 0
        let frame_h = 0
        if (response.headers.has("image-width")) {
            frame_w = parseInt(response.headers.get("image-width"));
        } else {
            frame_w = this.cameraProps.previewWidth;
        }
        if (response.headers.has("image-height")) {
            frame_h = parseInt(response.headers.get("image-height"));
        } else {
            frame_h = this.cameraProps.previewHeight;
        }
        return response.blob().then(b => {
            return b.arrayBuffer().then(a => {
                let image = new PLRgbImage(a, frame_w, frame_h);
                return image;
            })
        })
    }

    /**
     * Packs a response from endpoints providing raw YCbCr 420 buffer as octet-stream and image size in headers
     *
     * @param  {Response} response
     * @returns {Promise<PLYCbCrImage>} the image in a promise
     */
    getPLYCbCrImageFromResponse(response) {
        let frame_w = 0
        let frame_h = 0
        if (response.headers.has("image-width")) {
            frame_w = parseInt(response.headers.get("image-width"));
        } else {
            frame_w = this.cameraProps.previewWidth;
        }
        if (response.headers.has("image-height")) {
            frame_h = parseInt(response.headers.get("image-height"));
        } else {
            frame_h = this.cameraProps.previewHeight;
        }
        return response.blob().then(b => {
            return b.arrayBuffer().then(a => {
                let image = new PLYCbCrImage(a, frame_w, frame_h);
                return image;
            })
        })
    } 
}
