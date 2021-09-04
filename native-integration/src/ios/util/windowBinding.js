const bindToWindow = function(camera){
    if (window !== undefined) {
        window.onNativeCameraInitialized = camera.onNativeCameraInitialized;
        window.onPictureTaken = camera.onPictureTaken;
        window.getPreviewFrame = camera.getPreviewFrame;
        window.getRawFrame = camera.getRawFrame;
        window.getSnapshot = camera.getSnapshot;
        window.getPLRgbImageFromResponse = camera.getPLRgbImageFromResponse;
        window.onFrameGrabbed = camera.onFrameGrabbed;
        window.onFramePreview = camera.onFramePreview;
        window.onFramePreview = camera.onFramePreview;
        window.onCameraInitializedCallBack = camera.onCameraInitializedCallBack;
        window.placeUint8RGBArrayInCanvas = camera.placeUint8RGBArrayInCanvas;
        window.show = camera.show;
        window.hide = camera.hide;
    }
}

module.exports = {
    bindToWindow
}