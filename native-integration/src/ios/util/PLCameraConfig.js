/** Class wrapping a camera configuration */
class PLCameraConfig {

    /** creates a camera configuration for use with function `startNativeCameraWithConfig`
     * @param  {string} sessionPreset one of the session presets available in sessionPresetNames
     * @param  {string} flashConfiguration="auto" can be `torch`, `flash`, or `off`, all other values will be treated as `auto`
     * @param  {boolean} continuousFocus=true Defines the preferred [AVCaptureDevice.FocusMode](https://developer.apple.com/documentation/avfoundation/avcapturedevice/focusmode). If true, preferred focusmode will be set to **continuousAutoFocus**, otherwise the mode will switch between **autoFocus** and **locked**.
     * @param  {boolean} autoOrientationEnabled=true If set to true, camera session will attempt to automatically adjust the preview and capture orientation based on the device orientation
     * @param  {[String]} deviceTypes=["wideAngleCamera"] Additional criteria for selecting the camera. Supported values are **tripleCamera**, **dualCamera**, **dualWideCamera**, **wideAngleCamera**, **ultraWideAngleCamera**, **telephotoCamera** and **trueDepthCamera**. Device discovery session will prioritize device types in the array based on their array index.
     * @param  {String} cameraPosition="back" "back" or "front". If not defined, this setting will default to "back"
     * @param  {boolean} highResolutionCaptureEnabled=true If high resolution is enabled, the photo capture will be taken with the highest possible resolution available.
     * @param  {string | undefined} preferredColorSpace=undefined Possible values are "sRGB", "P3_D65" or "HLG_BT2020".
     * @param  {number} torchLevel=1.0 Float in the range of 0 to 1.0
     * @param  {number} aspectRatio=4.0/3.0 This value will not be used
     * @param  {string} initOrientation="portrait" Predefines the orientation when initializing the camera (available values are "landscapeRight", "landscapeLeft" and "portrait").
     */
    constructor(sessionPreset, flashConfiguration = "auto", continuousFocus = true, autoOrientationEnabled = true, deviceTypes = ["wideAngleCamera"], cameraPosition = "back", highResolutionCaptureEnabled = true, preferredColorSpace = undefined, torchLevel = 1.0, aspectRatio = 4.0/3.0, initOrientation = "portrait") {
        this.sessionPreset = sessionPreset;
        this.flashConfiguration = flashConfiguration;
        this.torchLevel = torchLevel;
        this.continuousFocus = continuousFocus;
        this.autoOrientationEnabled = autoOrientationEnabled;
        this.deviceTypes = deviceTypes;
        this.cameraPosition = cameraPosition;
        this.highResolutionCaptureEnabled = highResolutionCaptureEnabled;
        this.preferredColorSpace = preferredColorSpace;
        this.aspectRatio = aspectRatio;
        this.initOrientation = initOrientation;
    }
}

module.exports = {
    PLCameraConfig
}