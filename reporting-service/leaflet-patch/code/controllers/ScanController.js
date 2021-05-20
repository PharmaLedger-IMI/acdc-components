import ContainerController from '../../cardinal/controllers/base-controllers/ContainerController.js';
import SettingsService from "../services/SettingsService.js";
import interpretGS1scan from "../gs1ScanInterpreter/interpretGS1scan/interpretGS1scan.js";
import utils from "../../utils.js";
import constants from "../../constants.js";
import DSUDataRetrievalService from "../services/DSUDataRetrievalService/DSUDataRetrievalService.js";

const gtinResolver = require("gtin-resolver");

export default class ScanController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.setModel({data: '', hasCode: false, hasError: false, nativeSupport: false, useScandit: false});
        this.settingsService = new SettingsService(this.DSUStorage);
        this.history = history;
        this.acdc = require('acdc').ReportingService.getInstance(this.DSUStorage, this.settingsService);
        this.model.onChange("data", () => {
            this.process(this.parseGS1Code(this.model.data));
        });

        this.getNativeApiHandler((err, handler) => {
            if (err) {
                console.log("Not able to activate native API support. Continue using bar code scanner from web.", err);
            }
            else if (handler) {
                this.model.nativeSupport = true;
                const scan = handler.importNativeAPI("dataMatrixScan");
                scan().then((resultArray) => {
                    if (resultArray && resultArray.length > 0) {
                        return this.process(this.parseGS1Code(resultArray[0]));
                    }
                    this.redirectToError("2dMatrix code scan process finished. No code scanned or process canceled.");
                }, (error) => {
                    switch (error) {
                        case "ERR_NO_CODE_FOUND":
                            this.redirectToError("No GS1 data matrix found.");
                            break;
                        case "ERR_SCAN_NOT_SUPPORTED":
                            this.redirectToError("The code cannot be scanned.");
                            break;
                        case "ERR_CAM_UNAVAILABLE":
                            this.redirectToError("No camera availcallbackable for scanning.");
                            break;
                        case "ERR_USER_CANCELLED":
                            this.history.push(`${new URL(this.history.win.basePath).pathname}home`);
                            break;
                        default:
                            this.redirectToError("Failed to scan GS1 data matrix.");
                    }
                }).catch((err) => {
                    this.redirectToError("Code scanning and processing finished with errors.");
                });
            } else {
                this.settingsService.readSetting("scanditlicense", (err, scanditLicense) => {
                    if (scanditLicense && window.ScanditSDK) {
                        this.model.useScandit = true;
                        this.initScanditLib(scanditLicense)
                    }
                });
            }
        });
    }

    callAfterElementLoad(querySelector, callback, ms = 100) {
        const delayedInit = () => {
            const element = this.element.querySelector(querySelector)
            if (element) {
                callback(element)
            } else {
                setTimeout(delayedInit, ms);
            }
        };

        delayedInit();
    }

    parseGS1Code(scannedBarcode) {
        let gs1FormatFields;
        try {
            gs1FormatFields = interpretGS1scan.interpretScan(scannedBarcode);
        } catch (e) {
            this.redirectToError("Barcode is not readable, please contact pharmacy / doctor who issued the medicine package.", this.parseGs1Fields(e.dlOrderedAIlist));
            return;
        }

        return this.parseGs1Fields(gs1FormatFields.ol);
    }

    parseCompositeCodeScan(barrcodesArray) {
        this.model.hasCode = true;
        const gtinObject = barrcodesArray.find((item) => item.symbology.indexOf('databar') !== -1)
        const batchAndExpiriCodeObject = barrcodesArray.find((item) => item.symbology === "micropdf417")

        return this.parseGS1Code(`${gtinObject.data}${batchAndExpiriCodeObject.data}`)
    }

    parseEAN13CodeScan(scannedEan13Code) {
        let ean13 = scannedEan13Code ? scannedEan13Code : ""
        const length = scannedEan13Code && scannedEan13Code.length ? scannedEan13Code.length : 0;
        ean13 = ean13.padStart(14 - length, '0');
        return {
            "gtin": ean13,
            "batchNumber": "",
            "expiry": "",
            "serialNumber": ""
        }
    }

    process(gs1Fields) {
        if (!this.hasMandatoryFields(gs1Fields)) {
            return this.redirectToError("Barcode is not readable, please contact pharmacy / doctor who issued the medicine package.", gs1Fields);
        }

        const evt = this.acdc.createScanEvent(gs1Fields);

        this.buildSSI(gs1Fields, (err, gtinSSI) => {
            this.dsuDataRetrievalService = new DSUDataRetrievalService(this.DSUStorage, gtinSSI, utils.getMountPath(gtinSSI, gs1Fields));
            this.packageAlreadyScanned(gtinSSI, gs1Fields, (err, status) => {
                if (err) {
                    evt.report(response => {
                        return this.redirectToError("Product code combination could not be resolved.", gs1Fields);
                    });
                }
                if (status === false) {
                    this.batchAnchorExists(gtinSSI, (err, status) => {
                        if (status) {
                            evt.setBatchDSUStatus(true)
                            evt.report((response) => {
                                this.addPackageToHistoryAndRedirect(gtinSSI, gs1Fields, response, (err) => {
                                    if (err) {
                                        return console.log("Failed to add package to history", err);
                                    }
                                });
                            });

                        } else {
                            evt.setBatchDSUStatus(true);
                            this.addConstProductDSUToHistory(gs1Fields, evt);
                        }
                    });
                } else {
                    evt.setBatchDSUStatus(true);
                    evt.report(response => {
                        this.redirectToDrugDetails({gtinSSI: gtinSSI.getIdentifier(), acdc: response, gs1Fields});
                    });
                }
            });
        });
    }

    insertScanditStyles() {
        const style = document.createElement('style');

        style.setAttribute('type', 'text/css');
        style.innerHTML = ".scandit.scandit-container{width:100%;height:100%;display:flex;justify-content:center;align-items:center;overflow:hidden}.scandit.scandit-barcode-picker{position:relative;min-width:1px;min-height:1px;width:100%;height:100%;background-color:#000}.scandit .scandit-video{width:100%;height:100%;position:relative;display:block}.scandit .scandit-video.mirrored{transform:scaleX(-1)}.scandit .scandit-logo{bottom:5%;right:5%;max-width:35%;max-height:12.5%}.scandit .scandit-laser,.scandit .scandit-logo{position:absolute;pointer-events:none;transform:translateZ(0)}.scandit .scandit-laser{z-index:10;box-sizing:border-box;top:-9999px;display:flex;align-items:center}.scandit .scandit-laser img{width:100%;max-height:47px}.scandit .scandit-laser img,.scandit .scandit-viewfinder{position:absolute;transition:opacity .25s ease;animation-duration:.25s}.scandit .scandit-viewfinder{z-index:10;box-sizing:border-box;border:2px solid #fff;border-radius:10px;top:-9999px;pointer-events:none;transform:translateZ(0)}.scandit .scandit-viewfinder.paused{opacity:.4}.scandit .scandit-camera-switcher,.scandit .scandit-torch-toggle{-webkit-tap-highlight-color:rgba(255,255,255,0);position:absolute;top:5%;max-width:15%;max-height:15%;z-index:10;cursor:pointer;filter:drop-shadow(0 2px 0 #808080);transform:translateZ(0)}.scandit .scandit-camera-switcher{left:5%}.scandit .scandit-torch-toggle{right:5%}.scandit .scandit-camera-upload{-webkit-tap-highlight-color:rgba(255,255,255,0);width:100%;height:100%;z-index:5}.scandit .scandit-camera-upload,.scandit .scandit-camera-upload label{display:flex;flex-direction:column;justify-content:center;align-items:center}.scandit .scandit-camera-upload label{cursor:pointer;width:180px;height:180px;margin-top:18px;border-radius:50%}.scandit .scandit-camera-upload label input[type=file]{position:absolute;top:-9999px}.scandit .radial-progress{width:180px;height:180px;background-color:transparent;border-width:3px;border-style:solid;border-radius:50%;position:absolute;transition:opacity 1s ease,border-color .5s;animation-duration:.25s;box-sizing:border-box}.scandit .radial-progress[data-progress=\"0\"]{opacity:.2}.scandit .radial-progress[data-progress=\"5\"]{opacity:.24}.scandit .radial-progress[data-progress=\"10\"]{opacity:.28}.scandit .radial-progress[data-progress=\"15\"]{opacity:.32}.scandit .radial-progress[data-progress=\"20\"]{opacity:.36}.scandit .radial-progress[data-progress=\"25\"]{opacity:.4}.scandit .radial-progress[data-progress=\"30\"]{opacity:.44}.scandit .radial-progress[data-progress=\"35\"]{opacity:.48}.scandit .radial-progress[data-progress=\"40\"]{opacity:.52}.scandit .radial-progress[data-progress=\"45\"]{opacity:.56}.scandit .radial-progress[data-progress=\"50\"]{opacity:.6}.scandit .radial-progress[data-progress=\"55\"]{opacity:.64}.scandit .radial-progress[data-progress=\"60\"]{opacity:.68}.scandit .radial-progress[data-progress=\"65\"]{opacity:.72}.scandit .radial-progress[data-progress=\"70\"]{opacity:.76}.scandit .radial-progress[data-progress=\"75\"]{opacity:.8}.scandit .radial-progress[data-progress=\"80\"]{opacity:.84}.scandit .radial-progress[data-progress=\"85\"]{opacity:.88}.scandit .radial-progress[data-progress=\"90\"]{opacity:.92}.scandit .radial-progress[data-progress=\"95\"]{opacity:.96}.scandit .radial-progress[data-progress=\"100\"]{opacity:1}.scandit .scandit-flash-color{animation-name:scandit-flash-color}.scandit .scandit-flash-white{animation-name:scandit-flash-white}.scandit .scandit-flash-inset{animation-name:scandit-flash-inset}.scandit .scandit-opacity-pulse{animation-duration:.333s,1s;animation-iteration-count:1,infinite;animation-delay:0s,.333s;animation-timing-function:cubic-bezier(.645,.045,.355,1),cubic-bezier(.645,.045,.355,1);animation-name:scandit-opacity-pulse-before,scandit-opacity-pulse}.scandit .scandit-hidden-opacity{opacity:0}.scandit-hidden{display:none!important}@keyframes scandit-flash-color{0%{filter:none}50%{filter:drop-shadow(0 0 .75rem #fff) drop-shadow(0 0 2.5rem #7ed9e2)}to{filter:none}}@keyframes scandit-flash-white{0%{filter:none}50%{filter:drop-shadow(0 0 .5rem #fff) drop-shadow(0 0 1rem #fff) drop-shadow(0 0 2.5rem #fff)}to{filter:none}}@keyframes scandit-flash-inset{0%{box-shadow:none}50%{box-shadow:inset 0 0 .5rem,inset 0 0 1rem,inset 0 0 2.5rem}to{box-shadow:none}}@keyframes scandit-opacity-pulse-before{0%{opacity:1}to{opacity:.4}}@keyframes scandit-opacity-pulse{0%{opacity:.4}50%{opacity:.6}to{opacity:.4}}";

        this.callAfterElementLoad("#scandit-barcode-picker-wrapper", (element) => {
            element.appendChild(style);
        })
    }

    initScanditLib(scanditLicense) {
        this.insertScanditStyles()

        let compositeOngoing = false
        const compositeMap = {}
        compositeMap[4] = "databar-limited"
        compositeMap[2] = "micropdf417"


        const defaultScanSettings = {
            enabledSymbologies: ["databar-limited", "micropdf417", "data-matrix", "code128", "ean13"],
            maxNumberOfCodesPerFrame: 2
        }
        const createNewBarcodePicker = (scanSettings = defaultScanSettings) => {
            const scanningSettings = new window.ScanditSDK.ScanSettings(scanSettings)
            scanningSettings.getSymbologySettings('micropdf417').setColorInvertedEnabled(true)
            scanningSettings.getSymbologySettings('databar-limited').setColorInvertedEnabled(true)

            return new Promise((resolve, reject) => {
                this.callAfterElementLoad("#scandit-barcode-picker", (element) => {
                    return resolve(window.ScanditSDK.BarcodePicker.create(element, {
                        scanSettings: new window.ScanditSDK.ScanSettings(scanSettings),
                        guiStyle: "none",
                        videoFit: "cover"
                    }))
                })
            })

        }

        const newBarcodePickerCallback = (barcodePicker) => {
            barcodePicker.setMirrorImageEnabled(false);
            barcodePicker.on("scan", (scanResult) => {
                const firstBarcodeObj = scanResult.barcodes[0];
                const secondBarcodeObj = scanResult.barcodes[1];
                if (scanResult.barcodes.length === 2 && firstBarcodeObj.symbology !== secondBarcodeObj.symbology) {
                    barcodePicker.destroy()
                    compositeOngoing = false
                    return this.process(this.parseCompositeCodeScan(scanResult.barcodes));
                }

                if (firstBarcodeObj) {
                    // single barcode
                    if (firstBarcodeObj.compositeFlag < 2) {
                        compositeOngoing = false
                        barcodePicker.destroy()
                        if (firstBarcodeObj.symbology === "data-matrix") {
                            return this.process(this.parseGS1Code(firstBarcodeObj.data));
                        }
                        else if (firstBarcodeObj.symbology === "code128") {
                            return this.process(this.parseGS1Code(firstBarcodeObj.data));
                        }
                        else if (firstBarcodeObj.symbology === "ean13") {
                            return this.process(this.parseEAN13CodeScan(firstBarcodeObj.data))
                        }
                        else {
                            console.error(`Incompatible barcode scan: `, firstBarcodeObj)
                            throw new Error(`code symbology "${firstBarcodeObj.symbology}" not recognized.`)
                        }
                    }
                    // composite barcode
                    if (compositeOngoing) {
                        if (compositeMap[compositeOngoing.compositeFlag] === firstBarcodeObj.symbology) {
                            barcodePicker.destroy()
                            compositeOngoing = false
                            this.process(this.parseCompositeCodeScan([
                                compositeOngoing,
                                firstBarcodeObj
                            ]));
                        }
                    }
                    else {
                        compositeOngoing = firstBarcodeObj
                    }
                }
            });
        }

        window.ScanditSDK.configure(scanditLicense, {
            engineLocation: "https://cdn.jsdelivr.net/npm/scandit-sdk@5.x/build/",
        })
          .then(() => {
              return createNewBarcodePicker()
          })
          .then(newBarcodePickerCallback);
    }

    buildSSI(gs1Fields, callback) {
        this.settingsService.readSetting("networkname", (err, networkName) => {
            if (err || typeof networkName === "undefined") {
                networkName = constants.DEFAULT_NETWORK_NAME;
            }
            return callback(undefined, gtinResolver.createGTIN_SSI(networkName, undefined, gs1Fields.gtin, gs1Fields.batchNumber));
        });
    }

    addConstProductDSUToHistory(gs1Fields, evt) {
        this.createConstProductDSU_SSI(gs1Fields, (err, constProductDSU_SSI) => {
            if (err) {
                //todo: what to do in this case?
            }

            this.constProductDSUExists(constProductDSU_SSI, (err, status) => {
                if (err) {
                    evt.setProductDSUStatus(false);
                    evt.report(response => {
                        return console.log("Failed to check constProductDSU existence", err);
                    });
                }
                if (status) {
                    evt.setProductDSUStatus(true);
                    evt.report(response => {
                        this.addPackageToHistoryAndRedirect(constProductDSU_SSI, gs1Fields, response, (err) => {
                            if (err) {
                                return console.log("Failed to add package to history", err);
                            }
                        });
                    });
                } else {
                    evt.setProductDSUStatus(false);
                    evt.report((response) => {
                        return this.redirectToError("Product code combination could not be resolved.", gs1Fields);
                    });
                }
            });
        });
    }

    addPackageToHistoryAndRedirect(gtinSSI, gs1Fields, scanEvent, callback) {
        this.packageAlreadyScanned(gtinSSI, gs1Fields, (err, status) => {
            if (err) {
                return console.log("Failed to verify if package was already scanned", err);
            }

            if (!status) {
                this.addPackageToScannedPackagesList(gtinSSI, gs1Fields, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    this.redirectToDrugDetails({gtinSSI: gtinSSI.getIdentifier(), acdc: scanEvent, gs1Fields});
                });
            } else {
                this.redirectToDrugDetails({gtinSSI: gtinSSI.getIdentifier(), acdc: scanEvent, gs1Fields});
            }
        });

    }

    createConstProductDSU_SSI(gs1Fields, callback) {
        this.settingsService.readSetting("networkname", (err, networkName) => {
            if (err || typeof networkName === "undefined") {
                networkName = constants.DEFAULT_NETWORK_NAME;
            }
            return callback(undefined, gtinResolver.createGTIN_SSI(networkName, undefined, gs1Fields.gtin));
        });
    }

    redirectToDrugDetails(state) {
        this.history.push(`${new URL(this.history.win.basePath).pathname}drug-details`, state);
    }

    packageAlreadyScanned(packageGTIN_SSI, gs1Fields, callback) {
        this.DSUStorage.call("listDSUs", `/packages`, (err, dsuList) => {
            if (err) {
                return callback(err);
            }

            let packageIndex = dsuList.findIndex(dsu => utils.getMountPath(packageGTIN_SSI, gs1Fields).endsWith(dsu.path));
            if (packageIndex === -1) {
                callback(undefined, false);
            } else {
                utils.refreshMountedDSUs(this.dsuDataRetrievalService, this.DSUStorage, utils.getMountPath(packageGTIN_SSI, gs1Fields),(err) => {
                    if (err) {
                        return callback(err);
                    }

                    callback(undefined, true);
                });
            }
        });
    }

    addPackageToScannedPackagesList(packageGTIN_SSI, gs1Fields, callback) {
        const gtinSSIIdentifier = packageGTIN_SSI.getIdentifier();
        this.DSUStorage.call("mountDSU", utils.getMountPath(packageGTIN_SSI, gs1Fields), gtinSSIIdentifier, (err) => {
            if (err) {
                return callback(err);
            }

            this.DSUStorage.getObject(constants.PACKAGES_STORAGE_PATH, (err, packages) => {
                if (typeof packages === "undefined") {
                    packages = {};
                }
                packages[utils.getMountPath(packageGTIN_SSI, gs1Fields)] = gs1Fields;
                utils.refreshBatchDSU(this.DSUStorage, utils.getMountPath(packageGTIN_SSI, gs1Fields), (err) => {
                    if (err) {
                        return callback(err);
                    }
                    this.DSUStorage.setObject(constants.PACKAGES_STORAGE_PATH, packages, callback);
                });
            });
        });
    }

    constProductDSUExists(constProductDSU_SSI, callback) {
        this.DSUStorage.call("loadDSU", constProductDSU_SSI.getIdentifier(), (err) => {
            if (err) {
                return callback(undefined, false);
            }

            callback(undefined, true);
        });
    }

    batchAnchorExists(packageGTIN_SSI, callback) {
        this.DSUStorage.call("loadDSU", packageGTIN_SSI.getIdentifier(), (err, dsu) => {
            if (err) {
                return callback(undefined, false);
            }

            callback(undefined, true);
        });
    }

    parseGs1Fields(orderedList) {
        const gs1Fields = {};
        const fieldsConfig = {
            "GTIN": "gtin",
            "BATCH/LOT": "batchNumber",
            "SERIAL": "serialNumber",
            "USE BY OR EXPIRY": "expiry"
        };

        orderedList.map(el => {
            let fieldName = fieldsConfig[el.label];
            gs1Fields[fieldName] = el.value;
        })

        if (gs1Fields.expiry) {
            gs1Fields.expiry = utils.convertFromISOtoYYYY_HM(gs1Fields.expiry);
        }

        return gs1Fields;
    }

    hasMandatoryFields(gs1Fields) {
        if (!gs1Fields.gtin) {
            return false;
        }

        return true;
    }

    redirectToError(message, fields) {
        this.history.push({
            pathname: `${new URL(this.history.win.basePath).pathname}scan-error`,
            state: {
                message,
                fields
            }
        })
    }

    getNativeApiHandler(callback) {
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
}
