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
                this.elements.torchLevelRangeLabel.innerHTML = this.Camera.getStatus();
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
            this.Camera.setColorSpace(nextColorspace);
            this.elements.colorspaceButton.innerHTML = this.Camera.getStatus();
        });
        this.elements.continuousAFButton.addEventListener('click', (e) => {
            this.Camera.toggleContinuousAF()
            this.elements.continuousAFButton.innerHTML = this.Camera.getStatus();
        });
        this.elements.selectCameraButton.addEventListener('click', (e) => {
            this.Camera.switchCamera()
            this.elements.selectCameraButton.innerHTML = this.Camera.getStatus();
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
            this.elements.flashButton.innerHTML = this.Camera.getStatus();
        });
    }
    
    _initializeValues(){
        this.elements.torchRange.value = "1.0";
        this.elements.torchLevelRangeLabel.innerHTML = `Torch Level: ${this.elements.torchRange.value}`;

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

    ChangeDesiredCamerasList() {
        for (let i = 0; i < this.elements.select_cameras.options.length; i++) {
            if (this.elements.select_cameras.options[i].selected) {
                this.elements.selectedDevicesNames.push(this.elements.select_cameras.options[i].value);
            }
        }
    }

    ChangePresetList() {
        let selectedPresetName = this.elements.select_preset.options[this.elements.select_preset.selectedIndex].value;
        this.elements.status_test.innerHTML = selectedPresetName;
    }

    hide(element) {
        element.style.display = "none";
    }

    show(element) {
        element.style.display = "block";
    }
}
