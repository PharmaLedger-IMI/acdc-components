const {PLRgbImage} = require('./PLRgbImage');
const {PLYCbCRImage} = require('./PLYCbCrImage');


/**
 *
 * METHODS FROM BRIDGE FILE
 *
 */

function callNative(api, args, callback) {
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
 * Sets the raw crop to a new position
 * @param {CameraProps} cameraProps
 * @param  {number} x
 * @param  {number} y
 * @param  {number} w
 * @param  {number} h
 */
function setRawCropRoi(cameraProps, x, y, w, h) {
    cameraProps._x = x;
    cameraProps._y = y;
    cameraProps._w = w;
    cameraProps._h = h;
}

/**
 * Stops the native camera
 */
function stopNativeCamera(cameraProps) {
    clearInterval(cameraProps._previewHandle)
    cameraProps._previewHandle = undefined
    clearInterval(cameraProps._grabHandle)
    cameraProps._grabHandle = undefined
    callNative("StopCamera")
}

/**
 * Takes a photo and return it as base64 string ImageData in callback function
 * @param  {function} onCaptureCallback callback reached when the picture is taken. The callback receives the picture as base64 string
 */
function takePictureBase64NativeCamera(onCaptureCallbackname) {
    callNative("TakePicture", { "onCaptureJsCallback": onCaptureCallbackname.name });
}

/**
 * Gets a JPEG snapshot, corresponds to endpoint /snapshot
 * @returns {Promise<void | Blob>} JPEG snapshot
 */
function getSnapshot(cameraProps) {
    return fetch(`${cameraProps._serverUrl}/snapshot`)
        .then(response => {
            return response.blob();
        })
        .catch(error => {
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
    callNative("SetTorchLevel", { "level": level })
}

/**
 * Control preferred colorspace. The call may not succeed if the colorspace is not available.
 * In this case the colorspace is reverted to undefined.
 * @param  {string} colorspace 'sRGB', 'HLG_BT2020', 'P3_D65'
 */
function setPreferredColorSpaceNativeCamera(colorspace) {
    callNative("SetPreferredColorSpace", { "colorspace": colorspace })
}

/**
 * Gets a downsampled RGB frame for preview, corresponds to endpoint /previewframe
 * @param {CameraProps} cameraProps
 * @returns  {Promise<void | PLRgbImage>} Downsampled RGB frame for preview
 */
function getPreviewFrame(cameraProps) {
    return fetch(`${cameraProps._serverUrl}/previewframe`)
        .then(response => {
            let image = getPLRgbImageFromResponse(cameraProps, response);
            return image;
        })
        .catch(error => {
            console.log(error);
        })
}

/**
 * Gets a raw RGB frame. A ROI can be specified, corresponds to endpoint /rawframe
 * @param {CameraProps} cameraProps
 * @param  {number} [x=undefined]
 * @param  {number} [y=undefined]
 * @param  {number} [w=undefined]
 * @param  {number} [h=undefined]
 * @returns {Promise<void | PLRgbImage>} a raw RGB frame
 */
function getRawFrame(cameraProps, x = undefined, y = undefined, w = undefined, h = undefined) {
    let fetchString = `${cameraProps._serverUrl}/rawframe`;
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
            let image = getPLRgbImageFromResponse(cameraProps, response);
            return image;
        })
        .catch(error => {
            console.log(error);
        })
}

/** Get a raw YCbCr 420 frame A ROI can be specified, corresponds to endpoint /rawframe_ycbcr
 * @param {CameraProps} cameraProps
 * @param  {number} [x=undefined]
 * @param  {number} [y=undefined]
 * @param  {number} [w=undefined]
 * @param  {number} [h=undefined]
 * @returns {Promise<Void | PLYCbCrImage>} a raw YCbCr frame
 */
function getRawFrameYCbCr(cameraProps, x = undefined, y = undefined, w = undefined, h = undefined) {
    let fetchString = `${cameraProps._serverUrl}/rawframe_ycbcr`;
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
            let image = getPLYCbCrImageFromResponse(cameraProps, response);
            return image;
        })
        .catch(error => {
            console.log(error);
        })
}
/**
 * Get the current camera configuration, corresponds to endpoint /cameraconfig
 * @param {CameraProps} cameraProps
 * @returns {Promise<any>} the current camera configuration
 */
function getCameraConfiguration(cameraProps) {
    let fetchString = `${cameraProps._serverUrl}/cameraconfig`;
    return fetch(fetchString)
        .then(response => {
            return response.json()
        })
}

/**
 * Packs a response from endpoints providing raw rgb buffer as octet-stream and image size in headers
 * @param {CameraProps} cameraProps
 * @param  {Response} response
 * @returns {Promise<PLRgbImage>} the image in a promise
 */
function getPLRgbImageFromResponse(cameraProps, response) {
    let frame_w = 0
    let frame_h = 0
    if (response.headers.has("image-width")) {
        frame_w = parseInt(response.headers.get("image-width"));
    } else {
        frame_w = cameraProps.previewWidth;
    }
    if (response.headers.has("image-height")) {
        frame_h = parseInt(response.headers.get("image-height"));
    } else {
        frame_h = cameraProps.previewHeight;
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
 * @param {CameraProps} cameraProps

 * @param  {Response} response
 * @returns {Promise<PLYCbCrImage>} the image in a promise
 */
function getPLYCbCrImageFromResponse(cameraProps, response) {
    let frame_w = 0
    let frame_h = 0
    if (response.headers.has("image-width")) {
        frame_w = parseInt(response.headers.get("image-width"));
    } else {
        frame_w = cameraProps.previewWidth;
    }
    if (response.headers.has("image-height")) {
        frame_h = parseInt(response.headers.get("image-height"));
    } else {
        frame_h = cameraProps.previewHeight;
    }
    return response.blob().then(b => {
        return b.arrayBuffer().then(a => {
            let image = new PLYCbCrImage(a, frame_w, frame_h);
            return image;
        })
    })
}


/**
 * Starts the native camera frame grabber
 * @param {CameraProps} cameraProps
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
function startNativeCamera(cameraProps, sessionPresetName, flashMode, onFramePreviewCallback = undefined, targetPreviewFps = 25, previewWidth = 640, onFrameGrabbedCallBack = undefined, targetGrabFps = 10, auto_orientation_enabled = false, onCameraInitializedCallBack = undefined, x = undefined, y = undefined, w = undefined, h = undefined, ycbcr = false) {
    cameraProps._targetPreviewFps = targetPreviewFps
    cameraProps._previewWidth = previewWidth
    cameraProps._onFramePreviewCallback = onFramePreviewCallback;
    cameraProps._onFrameGrabbedCallBack = onFrameGrabbedCallBack;
    cameraProps._onCameraInitializedCallBack = onCameraInitializedCallBack;
    cameraProps._ycbcr = ycbcr;
    cameraProps._targetGrabFps = targetGrabFps
    setRawCropRoi(cameraProps, x, y, w, h);
    let params = {
        "onInitializedJsCallback": "_onNativeCameraInitialized",
        "sessionPreset": sessionPresetName,
        "flashMode": flashMode,
        "previewWidth": previewWidth,
        "auto_orientation_enabled": auto_orientation_enabled
    }
    this.callNative("StartCamera", params);
}

/**
 * @param {cameraProps} cameraProps
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
function startNativeCameraWithConfig(cameraProps, config, onFramePreviewCallback = undefined, targetPreviewFps = 25, previewWidth = 640, onFrameGrabbedCallBack = undefined, targetGrabFps = 10, onCameraInitializedCallBack = undefined, x = undefined, y = undefined, w = undefined, h = undefined, ycbcr = false) {
    cameraProps._targetPreviewFps = targetPreviewFps
    cameraProps._previewWidth = previewWidth
    cameraProps._onFramePreviewCallback = onFramePreviewCallback;
    cameraProps._onFrameGrabbedCallBack = onFrameGrabbedCallBack;
    cameraProps._onCameraInitializedCallBack = onCameraInitializedCallBack;
    cameraProps._ycbcr = ycbcr;
    cameraProps._targetGrabFps = targetGrabFps
    setRawCropRoi(cameraProps, x, y, w, h);
    let params = {
        "onInitializedJsCallback": "_onNativeCameraInitialized",
        "previewWidth": previewWidth,
        "config": config
    }
    callNative("StartCameraWithConfig", params);
}

function onNativeCameraInitialized(camera, cameraProps){
    return function(wsPort){
        cameraProps._serverUrl = `http://localhost:${wsPort}`
        if (cameraProps._onFramePreviewCallback !== undefined) {
            cameraProps._previewHandle = setInterval(() => {
                let t0 = performance.now();
                getPreviewFrame(cameraProps).then(image => {
                    if (image instanceof PLRgbImage)
                        camera.onFramePreview(image, performance.now() - t0)
                });
            }, 1000 / cameraProps._targetPreviewFps);
        }
        if (cameraProps._onFrameGrabbedCallBack !== undefined) {
            cameraProps._grabHandle = setInterval(() => {
                let t0 = performance.now();
                if (cameraProps._ycbcr) {
                    getRawFrameYCbCr(cameraProps, cameraProps._x, cameraProps._y, cameraProps._w, cameraProps._h).then(image => {
                        if (image instanceof PLYCbCrImage)
                            camera.onFrameGrabbed(image, performance.now() - t0);
                    });
                } else {
                    getRawFrame(cameraProps, cameraProps._x, cameraProps._y, cameraProps._w, cameraProps._h).then(image => {
                        if (image instanceof PLRgbImage)
                            camera.onFrameGrabbed(image, performance.now() - t0);
                    });
                }
            }, 1000 / cameraProps._targetGrabFps);
        }
        if (cameraProps._onCameraInitializedCallBack !== undefined) {
            setTimeout(() => {
                camera._onCameraInitializedCallBack();
            }, 500);
        }
    }
}

function placeUint8RGBArrayInCanvas(cameraProps, canvasElem, array, w, h) {
    let a = 1;
    let b = 0;
    if (cameraProps.invertRawFrameCheck.checked === true) {
        a = -1;
        b = 255;
    }
    canvasElem.width = w;
    canvasElem.height = h;
    let ctx = canvasElem.getContext('2d');
    let clampedArray = new Uint8ClampedArray(w * h * 4);
    let j = 0
    for (let i = 0; i < 3 * w * h; i += 3) {
        clampedArray[j] = b + a * array[i];
        clampedArray[j + 1] = b + a * array[i + 1];
        clampedArray[j + 2] = b + a * array[i + 2];
        clampedArray[j + 3] = 255;
        j += 4;
    }
    let imageData = new ImageData(clampedArray, w, h);
    ctx.putImageData(imageData, 0, 0);
}

function placeUint8GrayScaleArrayInCanvas(cameraProps, canvasElem, array, w, h) {
    let a = 1;
    let b = 0;
    if (cameraProps.invertRawFrameCheck.checked === true) {
        a = -1;
        b = 255;
    }
    canvasElem.width = w;
    canvasElem.height = h;
    let ctx = canvasElem.getContext('2d');
    let clampedArray = new Uint8ClampedArray(w * h * 4);
    let j = 0
    for (let i = 0; i < w * h; i++) {
        clampedArray[j] = b + a * array[i];
        clampedArray[j + 1] = b + a * array[i];
        clampedArray[j + 2] = b + a * array[i];
        clampedArray[j + 3] = 255;
        j += 4;
    }
    let imageData = new ImageData(clampedArray, w, h);
    ctx.putImageData(imageData, 0, 0);
}

function placeUint8CbCrArrayInCanvas(canvasElemCb, canvasElemCr, array, w, h) {
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

module.exports = {
    stopNativeCamera,
    takePictureBase64NativeCamera,
    getSnapshot,
    setFlashModeNativeCamera,
    setTorchLevelNativeCamera,
    getPreviewFrame,
    setPreferredColorSpaceNativeCamera,
    getRawFrame,
    getCameraConfiguration,
    startNativeCamera,
    startNativeCameraWithConfig,
    setRawCropRoi,
    placeUint8RGBArrayInCanvas,
    placeUint8GrayScaleArrayInCanvas,
    placeUint8CbCrArrayInCanvas,
    onNativeCameraInitialized
}

