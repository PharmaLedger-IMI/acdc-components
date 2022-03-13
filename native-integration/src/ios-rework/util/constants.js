
const sessionPresetNames = [
    "low",
    "medium",
    "high",
    "inputPriority",
    "hd1280x720",
    "hd1920x1080",
    "hd4K3840x2160",
    "iFrame960x540",
    "iFrame1280x720",
    "vga640x480",
    "cif352x288",
    "photo"
];

const deviceTypeNames = [
    "wideAngleCamera",
    "tripleCamera",
    "dualCamera",
    "dualWideCamera",
    "ultraWideAngleCamera",
    "telephotoCamera",
    "trueDepthCamera"
]

const colorSpaces = {
    sRGB: 'sRGB',
    HLG_BT2020: 'HLG_BT2020',
    P3_D65: 'P3_D65'
}

module.exports = {
    sessionPresetNames,
    deviceTypeNames,
    colorSpaces
}