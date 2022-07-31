const {PLRgbImage} = require('./PLRgbImage');
const {PLYCbCrImage} = require('./PLYCbCrImage');

var _previewHandle = undefined;
var _grabHandle = undefined;
var _onFramePreviewCallback = undefined;
var _targetPreviewFps = 20;
var _previewWidth = 0;
var _serverUrl = undefined;
var _cameraRunning = false;
var _onFrameGrabbedCallBack = undefined;
var _onCameraInitializedCallBack = undefined;
var _targetGrabFps = 1;
var _ycbcr = false;
var _x = undefined;
var _y = undefined;
var _w = undefined;
var _h = undefined;

var _nativeBridge = undefined;
function buildNativeBridge(callback) {
    try {
      const nativeBridgeSupport = window.opendsu_native_apis;
      if (typeof nativeBridgeSupport === "object") {
        return nativeBridgeSupport.createNativeBridge(callback);
      }
      callback(undefined, undefined);
    } catch (err) {
      console.log("Caught an error during initialization of the native API bridge", err);
    }
}

function getNativeBridge(callback) {
    if (typeof _nativeBridge !== 'undefined') {
        callback(_nativeBridge);
    } else {
        buildNativeBridge( (error, bridge) => {
            _nativeBridge = bridge;
            callback(bridge);
        });
    }
}

class PushStreamToPullStreamAdapter {
    constructor(nativeBridge) {
        this.nativeBridge = nativeBridge;
    }

    openStream() {
        this.api = this.nativeBridge.importNativePushStreamAPI("pharmaLedgerCameraPushStreamAPI");
        const self = this; 
        return new Promise((resolve, reject) => {
            self.api.openStream().then(() => {
                self.api.openChannel("main").then((mainChannel) => {
                    self.mainChannel = mainChannel;
                    self.api.openChannel("secondary").then((secondaryChannel) => {
                        self.secondaryChannel = secondaryChannel;
                        resolve();
                    }, reject);
                }, reject);
            }, reject);
        });
    }

    retrieveNextValue(inputArray) {
        const self = this;
        return new Promise((resolve, reject) => {
            let stringifiedJSON = inputArray[0];
            self.mainChannel.send(stringifiedJSON);
            self.mainChannel.setNewEventHandler((eventData) => {
                resolve([eventData]);
            });
        });
    }

    retrieveServerData(url, httpResponseHandler, callName, params, dataPacketHandler) {
        const jsonString = JSON.stringify({"callName": callName, "params": params});
        const self = this;
        self.secondaryChannel.send(jsonString);
        self.secondaryChannel.setNewEventHandler((data) => {
            dataPacketHandler(data);
        });
    }
}

var _plCameraAPI = undefined;
var usePushStreamWrapper = true;
function buildPLCameraAPI(callback) {
    getNativeBridge((bridge) => {
        if (usePushStreamWrapper) {
            callback(new PushStreamToPullStreamAdapter(bridge));
        } else {
            const result = bridge.importNativeStreamAPI("pharmaLedgerCameraAPI");
            callback(result);
        }
    })
}

function getPLCameraAPI(callback) {
    if (typeof _plCameraAPI !== 'undefined') {
        callback(_plCameraAPI);
    } else {
       buildPLCameraAPI((api) => {
           api.openStream().then(() => {
            _plCameraAPI = api;
            api.retrieveServerData = function(url, httpResponseHandler, 
                                              callName, params, dataPacketHandler,
                                              reject) {
                fetch(url).then((response) => {
                    httpResponseHandler(response);
                }, reject);
            };
            callback(api);
           }, (error) => {
               console.log("ERROR WHILE OPENING PLCAMERAAPI " + error);
           });
       });
    }
}

function plCameraAPICall(name, args, successCallback, errorCallback) {
    const encodedMessage = JSON.stringify({ "name": name, "args": args });
    getPLCameraAPI((api) => {
        api.retrieveNextValue([encodedMessage]).then((successResultsArray) => {
            if (successCallback) {
                successCallback(successResultsArray);
            }
        }, (error) => {
            if (errorCallback) {
                errorCallback(error);
            }
        });
    });
}


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
    //callNative("StartCamera", params);
    plCameraAPICall("StartCamera", params, (resultsArray) => {
        print("StartCamera success, results " + resultsArray[0]);
        const serverURL = resultsArray[0];
        onNativeCameraInitialized(serverURL);
    });
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
        "onInitializedJsCallback": window.Native.Camera._onNativeCameraInitialized.name,
        "previewWidth": _previewWidth,
        "config": config
    }
    //callNative("StartCameraWithConfig", params);
    plCameraAPICall("StartCameraWithConfig", params, (resultsArray) => {
        console.log("StartCamera success, results " + resultsArray[0]);
        const serverURL = resultsArray[0];
        window.Native.Camera._onNativeCameraInitialized(serverURL);
    }, (error) => {
        console.log("Start camera config error: " + error);
    })
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
    //callNative("StopCamera")
    plCameraAPICall("StopCamera");
}

/**
 * Takes a photo and return it as base64 string ImageData in callback function
 * @param  {function} onCaptureCallback callback reached when the picture is taken. The callback receives the picture as base64 string
 */
function takePictureBase64NativeCamera(onCaptureCallback) {
    //callNative("TakePicture", {"onCaptureJsCallback": onCaptureCallback.name});
    plCameraAPICall("TakePicture", {}, (resultsArray) => {
        console.log("TakePicture success: " + resultsArray[0]);
        const image = resultsArray[0];
        onCaptureCallback(image);
    }, (error) => {
        console.log("TakePicture error " + error);
    })
}

/**
 * Gets a JPEG snapshot, corresponds to endpoint /snapshot
 * @returns {Promise<void | Blob>} JPEG snapshot
 */
 function getSnapshot() {
    let fetchString = `${_serverUrl}/snapshot`;
    return new Promise((resolve, reject) => {
        getPLCameraAPI((api) => {
            api.retrieveServerData(fetchString, (response) => {
                response.blob().then(resolve, reject);
            }, "snapshotJPEG", {}, (data) => {
                resolve(new Blob([data]));
            });
        });
    });

    // return fetch(`${_serverUrl}/snapshot`)
    // .then(response => {
    //     return response.blob();
    // })
    // .catch( error => {
    //     console.log(error);
    // })
}

/**
 * Control camera flash mode
 * @param  {string} mode can be `torch`, `flash`, or `off`, all other values will be treated as `auto`
 */
function setFlashModeNativeCamera(mode) {
    //callNative("SetFlashMode", { "mode": mode })
    plCameraAPICall("SetFlashMode", { "mode": mode }, () => {
        console.log("SetFlashMode success");
    }, (error) => {
        console.log("SetFlashMode error");
    });
}

/**
 * Control camera torch level
 * @param  {number} level torch level between (0.0, 1.0]
 */
function setTorchLevelNativeCamera(level) {
    //callNative("SetTorchLevel", { "level": level})
    plCameraAPICall("SetTorchLevel", { "level": level}, () => {
        console.log("SetTorchLevel success");
    }, (error) => {
        console.log("SetTorchMode error");
    });
}

/**
 * Control preferred colorspace. The call may not succeed if the colorspace is not available. 
 * In this case the colorspace is reverted to undefined. 
 * @param  {string} colorspace 'sRGB', 'HLG_BT2020', 'P3_D65'
 */
function setPreferredColorSpaceNativeCamera(colorspace) {
    //callNative("SetPreferredColorSpace", { "colorspace": colorspace })
    plCameraAPICall("SetPreferredColorSpace", { "colorspace": colorspace }, () => {
        console.log("SetPreferredColorSpace success");
    }, (error) => {
        console.log("SetPreferredColorSpace error: " + error);
    });
}

function onNativeCameraInitialized(serverURL) {
    _serverUrl = serverURL;
    window.Native.Camera.cameraProps._serverUrl = _serverUrl;
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
    let fetchString = `${_serverUrl}/previewframe`;
    return new Promise((resolve, reject) => {
        getPLCameraAPI((api) => {
            api.retrieveServerData(fetchString, (response) => {
                getPLRgbImageFromResponse(response).then(resolve, reject);
            }, "previewFrame", {}, (arrayBuffer) => {
                const sizeView = new Int32Array(arrayBuffer);
                const width = sizeView[0];
                const height = sizeView[1];
                let image = new PLRgbImage(arrayBuffer.slice(8), width, height);
                resolve(image);
            });
        });
    });

    // return fetch(`${_serverUrl}/previewframe`)
    // .then(response => {
    //     let image = getPLRgbImageFromResponse(response);
    //     return image;
    // })
    // .catch( error => {
    //     console.log(error);
    // })
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

    return new Promise((resolve, reject) => {
        getPLCameraAPI((api) => {
            api.retrieveServerData(fetchString, (response) => {
                getPLRgbImageFromResponse(response).then(resolve, reject);
            }, "rawFrame", params, (arrayBuffer) => {
                const sizeView = new Int32Array(arrayBuffer);
                const width = sizeView[0];
                const height = sizeView[1];
                let image = new PLRgbImage(arrayBuffer.slice(8), width, height);
                resolve(image);
            })
        });
    });

    // return fetch(fetchString)
    // .then(response => {
    //     let image = getPLRgbImageFromResponse(response);
    //     return image;
    // })
    // .catch( error => {
    //     console.log(error);
    // })
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
    
    return new Promise((resolve, reject) => {
        getPLCameraAPI((api) => {
            api.retrieveServerData(fetchString, (response) => {
                getPLYCbCrImageFromResponse(response).then(resolve, reject);
            }, "rawFrameYCBCR", params, (arrayBuffer) => {
                const sizeView = new Int32Array(arrayBuffer);
                const width = sizeView[0];
                const height = sizeView[1];
                let image = new PLYCbCrImage(arrayBuffer.slice(8), width, height);
                resolve(image);
            })
        });
    });

    // return fetch(fetchString)
    // .then(response => {
    //     let image = getPLYCbCrImageFromResponse(response);
    //     return image;
    // })
    // .catch( error => {
    //     console.log(error);
    // })
}
/**
 * Get the current camera configuration, corresponds to endpoint /cameraconfig
 * @returns {Promise<any>} the current camera configuration
 */
function getCameraConfiguration() {
    let fetchString = `${_serverUrl}/cameraconfig`;
    return new Promise((resolve, reject) => {
        getPLCameraAPI((api) => {
            api.retrieveServerData(fetchString, (response) => {
                response.json().then(resolve, reject)
            }, "cameraConfig", {}, (dataText) => {
                resolve(JSON.parse(dataText));
            });
        });
    });

    // let fetchString = `${_serverUrl}/cameraconfig`;
    // return fetch(fetchString)
    // .then(response => {
    //     return response.json()
    // })
}

/**
 * Get device information, corresponds to endpoint /deviceinfo
 * @returns {Promise<any>} the device information {"modelName": string, "systemVersion": string}
 */
function getDeviceInfo() {
    let fetchString = `${_serverUrl}/deviceinfo`;
    return new Promise((resolve, reject) => {
        getPLCameraAPI((api) => {
            api.retrieveServerData(fetchString, (response) => {
                response.json().then(resolve, reject);
            }, "deviceInfo", {}, (data) => {
                const resultObject = JSON.parse(data);
                resolve(resultObject);
            });
        });
    });


    // return fetch(fetchString)
    // .then(response => {
    //     return response.json()
    // })
}

function getDimensionsFromResponse(response){
    let {previewWidth, previewHeight} = window.Native.Camera.cameraProps;
    if (response.headers.has("image-width")) {
        previewWidth = parseInt(response.headers.get("image-width"));
    }
    if (response.headers.has("image-height")) {
        previewHeight = parseInt(response.headers.get("image-height"));
    }

    return {
        frame_w: previewWidth,
        frame_h: previewHeight
    }
}

/**
 * Packs a response from endpoints providing raw rgb buffer as octet-stream and image size in headers
 * 
 * @param  {Response} response
 * @returns {Promise<PLRgbImage>} the image in a promise
 */
function getPLRgbImageFromResponse(response) {
    const {frame_w, frame_h} = getDimensionsFromResponse(response);
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
    const {frame_w, frame_h} = getDimensionsFromResponse(response);
    return response.blob().then( b => {
        return b.arrayBuffer().then(a => {
            let image = new PLYCbCrImage(a, frame_w, frame_h);
            return image;
        })
    })
}

function placeUint8RGBArrayInCanvas(canvasElem, invert, array, w, h) {
    let a = 1;
    let b = 0;
    if (invert){
        a = -1;
        b = 255;
    }
    canvasElem.width = w;
    canvasElem.height = h;
    const ctx = canvasElem.getContext('2d');
    const clampedArray = new Uint8ClampedArray(w*h*4);
    let j = 0
    for (let i = 0; i < 3*w*h; i+=3) {
        clampedArray[j] = b+a*array[i];
        clampedArray[j+1] = b+a*array[i+1];
        clampedArray[j+2] = b+a*array[i+2];
        clampedArray[j+3] = 255;
        j += 4;
    }
    const imageData = new ImageData(clampedArray, w, h);
    ctx.putImageData(imageData, 0, 0);
}

function placeUint8GrayScaleArrayInCanvas(canvasElem, invert, array, w, h) {
    let a = 1;
    let b = 0;
    if (invert){
        a = -1;
        b = 255;
    }
    canvasElem.width = w;
    canvasElem.height = h;
    const ctx = canvasElem.getContext('2d');
    const clampedArray = new Uint8ClampedArray(w*h*4);
    let j = 0
    for (let i = 0; i < w*h; i++) {
        clampedArray[j] = b+a*array[i];
        clampedArray[j+1] = b+a*array[i];
        clampedArray[j+2] = b+a*array[i];
        clampedArray[j+3] = 255;
        j += 4;
    }
    const imageData = new ImageData(clampedArray, w, h);
    ctx.putImageData(imageData, 0, 0);
}

function placeUint8CbCrArrayInCanvas(canvasElemCb, canvasElemCr, array, w, h) {
    canvasElemCb.width = w;
    canvasElemCb.height = h;
    canvasElemCr.width = w;
    canvasElemCr.height = h;
    const ctxCb = canvasElemCb.getContext('2d');
    const ctxCr = canvasElemCr.getContext('2d');
    const clampedArrayCb = new Uint8ClampedArray(w*h*4);
    const clampedArrayCr = new Uint8ClampedArray(w*h*4);
    let j = 0
    for (let i = 0; i < 2*w*h; i+=2) {
        clampedArrayCb[j] = array[i];
        clampedArrayCb[j+1] = array[i];
        clampedArrayCb[j+2] = array[i];
        clampedArrayCb[j+3] = 255;
        clampedArrayCr[j] = array[i+1];
        clampedArrayCr[j+1] = array[i+1];
        clampedArrayCr[j+2] = array[i+1];
        clampedArrayCr[j+3] = 255;
        j += 4;
    }
    const imageDataCb = new ImageData(clampedArrayCb, w, h);
    ctxCb.putImageData(imageDataCb, 0, 0);
    const imageDataCr = new ImageData(clampedArrayCr, w, h);
    ctxCr.putImageData(imageDataCr, 0, 0);
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
    placeUint8RGBArrayInCanvas,
    placeUint8GrayScaleArrayInCanvas,
    placeUint8CbCrArrayInCanvas
}
