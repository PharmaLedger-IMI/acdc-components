const bindToWindow = function(camera){
    if (window !== undefined) {
        window.onNativeCameraInitialized = camera._onCameraInitializedCallBack.bind(camera);
        window.onPictureTaken = camera._onPictureTaken.bind(camera);
        window.getPreviewFrame = camera._onFramePreview.bind(camera);
        // window.getRawFrame = camera.getRawFrame.bind(camera);
        // window.getSnapshot = camera.getSnapshot.bind(camera);
        // window.getPLRgbImageFromResponse = camera.getPLRgbImageFromResponse.bind(camera);
        window.onFrameGrabbed = camera._onFrameGrabbed.bind(camera);
        window.onFramePreview = camera._onFramePreview.bind(camera);
        window.onFramePreview = camera._onFramePreview.bind(camera);
        window.onCameraInitializedCallBack = camera._onCameraInitializedCallBack.bind(camera);
        // window.placeUint8RGBArrayInCanvas = camera._placeUint8RGBArrayInCanvas.bind(camera);
    }
}

module.exports = {
    bindToWindow
}