
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

module.exports = {
    stopNativeCamera,
    takePictureBase64NativeCamera,
    getSnapshot,
    setFlashModeNativeCamera,
    setTorchLevelNativeCamera,
    getPreviewFrame,
    setPreferredColorSpaceNativeCamera,
    getRawFrame,
    getCameraConfiguration
}

