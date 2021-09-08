const {PLRgbImage} = require('./PLRgbImage');
const {PLYCbCrImage} = require('./PLYCbCrImage');
const {THREE} = require("./../lib/lib");

var _previewHandle = undefined;
var _grabHandle = undefined;
var _onFramePreviewCallback = undefined;
var _targetPreviewFps = 20;
var _previewWidth = 0;
var _serverUrl = undefined;
var _cameraRunning = false;
var _onFrameGrabbedCallBack = undefined;
var _onCameraInitializedCallBack = undefined;
var _targetGrabFps = 10;
var _ycbcr = false;
var _x = undefined;
var _y = undefined;
var _w = undefined;
var _h = undefined;

function callNative(api, args, callback) {
    // @ts-ignore
    let handle = window.webkit.messageHandlers[api]
    let payload = {}
    if (args !== undefined) {
        payload["args"] = args
    }
    if (callback !== undefined) {
        payload["callback"] = callback.name
    }
    handle.postMessage(payload)
}

/**
 * Starts the native camera frame grabber
 * @param  {string} sessionPresetName one of the session presets available in sessionPresetNames
 * @param  {string} flashMode can be `torch`, `flash`, or `off`, all other values will be treated as `auto`
 * @param  {function} onFramePreviewCallback callBack for each preview frame. Data are received as PLRgbImage. Can be undefined if you want to call 'getPreviewFrame' yourself
 * @param {number} targetPreviewFps fps for the preview
 * @param {number} previewWidth width for the preview data
 * @param {function} onFrameGrabbedCallBack callBack for each raw frame. Data are received as PLRgbImage or PLYCbCrImage. Can be undefined if you want to call 'getRawFrame' or 'getRawFrameYCbCr' yourself
 * @param {number} targetGrabFps fps for the full resolution raw frame
 * @param {boolean} [auto_orientation_enabled=false] set to true to rotate image feed with respect to device orientation
 * @param {function} onCameraInitializedCallBack called after camera initilaization is finished
 * @param  {number} [x=undefined] RGB/YCbCr raw frame ROI top-left x-coord
 * @param  {number} [y=undefined] RGB/YCbCr raw frame ROI top-left y-coord
 * @param  {number} [w=undefined] RGB/YCbCr raw frame ROI width
 * @param  {number} [h=undefined] RGB/YCbCr raw frame ROI height
 * @param  {boolean} [ycbcr=false] set to true to receive data as YCbCr 420 in 'onFrameGrabbedCallBack'
 */
function startNativeCamera(sessionPresetName, flashMode, onFramePreviewCallback = undefined, targetPreviewFps = 25, previewWidth = 640, onFrameGrabbedCallBack = undefined, targetGrabFps = 10, auto_orientation_enabled=false, onCameraInitializedCallBack = undefined, x=undefined, y=undefined, w=undefined, h=undefined, ycbcr=false) {
    _targetPreviewFps = targetPreviewFps
    _previewWidth = previewWidth
    _onFramePreviewCallback = onFramePreviewCallback;
    _onFrameGrabbedCallBack = onFrameGrabbedCallBack;
    _onCameraInitializedCallBack = onCameraInitializedCallBack;
    _ycbcr = ycbcr;
    _targetGrabFps = targetGrabFps
    setRawCropRoi(x, y, w, h);
    let params = {
        "onInitializedJsCallback": onNativeCameraInitialized.name,
        "sessionPreset": sessionPresetName,
        "flashMode": flashMode,
        "previewWidth": _previewWidth,
        "auto_orientation_enabled": auto_orientation_enabled
    }
    callNative("StartCamera", params);
}

/**
 * @param  {PLCameraConfig} config
 * @param  {function} onFramePreviewCallback callBack for each preview frame. Data are received as PLRgbImage. Can be undefined if you want to call 'getPreviewFrame' yourself
 * @param  {number} targetPreviewFps=25 fps for the preview
 * @param  {number} previewWidth=640 width for the preview data
 * @param  {function} onFrameGrabbedCallBack=undefined callBack for each raw frame. Data are received as PLRgbImage or PLYCbCrImage. Can be undefined if you want to call 'getRawFrame' or 'getRawFrameYCbCr' yourself
 * @param  {number} targetGrabFps=10 fps for the full resolution raw frame
 * @param  {function} onCameraInitializedCallBack=undefined called after camera initilaization is finished
 * @param  {number} x=undefined RGB/YCbCr raw frame ROI top-left x-coord
 * @param  {number} y=undefined RGB/YCbCr raw frame ROI top-left y-coord
 * @param  {number} w=undefined RGB/YCbCr raw frame ROI width
 * @param  {number} h=undefined RGB/YCbCr raw frame ROI height
 * @param  {boolean} ycbcr=false set to true to receive data as YCbCr 420 in 'onFrameGrabbedCallBack'
 */
function startNativeCameraWithConfig(config, onFramePreviewCallback = undefined, targetPreviewFps = 25, previewWidth = 640, onFrameGrabbedCallBack = undefined, targetGrabFps = 10, onCameraInitializedCallBack = undefined, x=undefined, y=undefined, w=undefined, h=undefined, ycbcr=false) {
    _targetPreviewFps = targetPreviewFps
    _previewWidth = previewWidth
    _onFramePreviewCallback = onFramePreviewCallback;
    _onFrameGrabbedCallBack = onFrameGrabbedCallBack;
    _onCameraInitializedCallBack = onCameraInitializedCallBack;
    _ycbcr = ycbcr;
    _targetGrabFps = targetGrabFps
    setRawCropRoi(x, y, w, h);
    let params = {
        "onInitializedJsCallback": onNativeCameraInitialized.name,
        "previewWidth": _previewWidth,
        "config": config
    }
    callNative("StartCameraWithConfig", params);
}

/**
 * Sets the raw crop to a new position
 * @param  {number} x
 * @param  {number} y
 * @param  {number} w
 * @param  {number} h
 */
function setRawCropRoi(x, y, w, h) {
    _x = x;
    _y = y;
    _w = w;
    _h = h;
}

/**
 * Stops the native camera
 */
function stopNativeCamera() {
    clearInterval(_previewHandle)
    _previewHandle = undefined
    clearInterval(_grabHandle)
    _grabHandle = undefined
    callNative("StopCamera")
}

/**
 * Takes a photo and return it as base64 string ImageData in callback function
 * @param  {function} onCaptureCallback callback reached when the picture is taken. The callback receives the picture as base64 string
 */
function takePictureBase64NativeCamera(onCaptureCallback) {

    callNative("TakePicture", {"onCaptureJsCallback": onCaptureCallback.name});
}

/**
 * Gets a JPEG snapshot, corresponds to endpoint /snapshot
 * @returns {Promise<void | Blob>} JPEG snapshot
 */
 function getSnapshot() {
    return fetch(`${_serverUrl}/snapshot`)
    .then(response => {
        return response.blob();
    })
    .catch( error => {
        console.log(error);
    })
}

/**
 * Control camera flash mode
 * @param  {string} mode can be `torch`, `flash`, or `off`, all other values will be treated as `auto`
 */
function setFlashModeNativeCamera(mode) {
    callNative("SetFlashMode", { "mode": mode })
}

/**
 * Control camera torch level
 * @param  {number} level torch level between (0.0, 1.0]
 */
function setTorchLevelNativeCamera(level) {
    callNative("SetTorchLevel", { "level": level})
}

/**
 * Control preferred colorspace. The call may not succeed if the colorspace is not available. 
 * In this case the colorspace is reverted to undefined. 
 * @param  {string} colorspace 'sRGB', 'HLG_BT2020', 'P3_D65'
 */
function setPreferredColorSpaceNativeCamera(colorspace) {
    callNative("SetPreferredColorSpace", { "colorspace": colorspace })
}

function onNativeCameraInitialized(wsPort) {
    _serverUrl = `http://localhost:${wsPort}`
    if (_onFramePreviewCallback !== undefined) {
        _previewHandle = setInterval(() => {
            let t0 = performance.now();
            getPreviewFrame().then(image => {
                if (image instanceof PLRgbImage) {
                    _onFramePreviewCallback(image, performance.now() - t0)
                }
            });
        }, 1000/_targetPreviewFps);
    }
    if (_onFrameGrabbedCallBack !== undefined) {
        _grabHandle = setInterval(() => {
            let t0 = performance.now();
            if (_ycbcr) {
                getRawFrameYCbCr(_x, _y, _w, _h).then(image => {
                    if (image instanceof PLYCbCrImage) {
                        _onFrameGrabbedCallBack(image, performance.now() - t0);
                    }
                })
            } else {
                getRawFrame(_x, _y, _w, _h).then(image => {
                    if (image instanceof PLRgbImage) {
                        _onFrameGrabbedCallBack(image, performance.now() - t0);
                    }
                })
            }
        }, 1000/_targetGrabFps)
    }
    if (_onCameraInitializedCallBack !== undefined) {
        setTimeout(() => {
            _onCameraInitializedCallBack();
        }, 500);
    }
}

/**
 * Gets a downsampled RGB frame for preview, corresponds to endpoint /previewframe
 * @returns  {Promise<void | PLRgbImage>} Downsampled RGB frame for preview
 */
function getPreviewFrame() {
    return fetch(`${_serverUrl}/previewframe`)
    .then(response => {
        let image = getPLRgbImageFromResponse(response);
        return image;
    })
    .catch( error => {
        console.log(error);
    })
}

/**
 * Gets a raw RGB frame. A ROI can be specified, corresponds to endpoint /rawframe
 * @param  {number} [x=undefined]
 * @param  {number} [y=undefined]
 * @param  {number} [w=undefined]
 * @param  {number} [h=undefined]
 * @returns {Promise<void | PLRgbImage>} a raw RGB frame
 */
function getRawFrame(x = undefined, y = undefined, w = undefined, h = undefined) {
    let fetchString = `${_serverUrl}/rawframe`;
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
        let image = getPLRgbImageFromResponse(response);
        return image;
    })
    .catch( error => {
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
function getRawFrameYCbCr(x = undefined, y = undefined, w = undefined, h = undefined) {
    let fetchString = `${_serverUrl}/rawframe_ycbcr`;
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
        let image = getPLYCbCrImageFromResponse(response);
        return image;
    })
    .catch( error => {
        console.log(error);
    })
}
/**
 * Get the current camera configuration, corresponds to endpoint /cameraconfig
 * @returns {Promise<any>} the current camera configuration
 */
function getCameraConfiguration() {
    let fetchString = `${_serverUrl}/cameraconfig`;
    return fetch(fetchString)
    .then(response => {
        return response.json()
    })
}

/**
 * Get device information, corresponds to endpoint /deviceinfo
 * @returns {Promise<any>} the device information {"modelName": string, "systemVersion": string}
 */
function getDeviceInfo() {
    let fetchString = `${_serverUrl}/deviceinfo`;
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
function getPLRgbImageFromResponse(response) {
    let frame_w = 0
    let frame_h = 0
    if (response.headers.has("image-width")) {
        frame_w = parseInt(response.headers.get("image-width"));
    }
    if (response.headers.has("image-height")) {
        frame_h = parseInt(response.headers.get("image-height"));
    }
    return response.blob().then( b => {
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
function getPLYCbCrImageFromResponse(response) {
    let frame_w = 0
    let frame_h = 0
    if (response.headers.has("image-width")) {
        frame_w = parseInt(response.headers.get("image-width"));
    }
    if (response.headers.has("image-height")) {
        frame_h = parseInt(response.headers.get("image-height"));
    }
    return response.blob().then( b => {
        return b.arrayBuffer().then(a => {
            let image = new PLYCbCrImage(a, frame_w, frame_h);
            return image;
        })
    })
}



function setupGLView(cameraProps, w, h) {
    cameraProps.scene = new THREE.Scene();
    // @ts-ignore
    cameraProps.camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 10000);
    // @ts-ignore
    cameraProps.renderer = new THREE.WebGLRenderer({ canvas: cameraProps.canvasgl, antialias: true });

    const {scene, camera, renderer, canvasgl, bytePerChannel, formatTexture} = cameraProps;

    let cameraHeight = h/2/Math.tan(camera.fov/2*(Math.PI/180))
    camera.position.set(0,0,cameraHeight);
    let clientHeight = Math.round(h/w * canvasgl.clientWidth);
    renderer.setSize(canvasgl.clientWidth, clientHeight);

    // @ts-ignore
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = false;

    cameraProps.controls = controls;

    const dataTexture = new Uint8Array(w * h * bytePerChannel);
    for (let i=0; i<w * h* bytePerChannel; i++)
        dataTexture[i] = 255;
    // @ts-ignore
    const frameTexture = new THREE.DataTexture(dataTexture, w, h, formatTexture, THREE.UnsignedByteType);
    frameTexture.needsUpdate = true;
    // @ts-ignore
    const planeGeo = new THREE.PlaneBufferGeometry(w, h);
    // @ts-ignore
    const material = new THREE.MeshBasicMaterial({
        map: frameTexture,
    });
    material.map.flipY = true;
    cameraProps.material = material;
    const plane = new THREE.Mesh(planeGeo, material);
    scene.add(plane);
    animate(cameraProps);
}

function animate(cameraProps) {
    window.requestAnimationFrame(() => animate(cameraProps));
    cameraProps.renderer.render(cameraProps.scene, cameraProps.camera);
}


module.exports = {
    startNativeCamera,
    startNativeCameraWithConfig,
    setRawCropRoi,
    stopNativeCamera,
    takePictureBase64NativeCamera,
    getSnapshot,
    setFlashModeNativeCamera,
    setTorchLevelNativeCamera,
    setPreferredColorSpaceNativeCamera,
    onNativeCameraInitialized,
    getPreviewFrame,
    getRawFrame,
    getRawFrameYCbCr,
    getCameraConfiguration,
    getDeviceInfo,
    getPLRgbImageFromResponse,
    getPLYCbCrImageFromResponse,
    setupGLView,
    animate,

}