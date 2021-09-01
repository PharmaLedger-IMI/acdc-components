const {WebcController} = WebCardinal.controllers;
import utils from "../../utils.js";
import DSUDataRetrievalService from "../services/DSUDataRetrievalService/DSUDataRetrievalService.js";
import constants from "../../constants.js";
import XMLDisplayService from "../services/XMLDisplayService/XMLDisplayService.js";

export default class DrugDetailsController extends WebcController {
  constructor(element, history) {
    super(element, history);
    this.model = {
      serialNumberLabel: constants.SN_LABEL,
      serialNumberVerification: constants.SN_OK_MESSAGE,
      productStatus: constants.PRODUCT_STATUS_OK_MESSAGE,
      packageVerification: "Action required",
      displayItems: 3,
      secondRowColumns: 3,
      showVerifyPackageButton: true,
      showReportButton: true,
      showAddToCabinetButton: true,
      serialNumber: "",
      showSmpc: false,
      showLeaflet: false,
      epiColumns: 0
    };

    this.model.SNCheckIcon = ""
    console.log(history.location.state);
    if (typeof history.location.state !== "undefined") {
      this.gtinSSI = history.location.state.gtinSSI;
      this.gs1Fields = history.location.state.gs1Fields;
      this.model.serialNumber = this.gs1Fields.serialNumber === "0" ? "-" : this.gs1Fields.serialNumber;
      this.model.gtin = this.gs1Fields.gtin;
      this.model.batchNumber = this.gs1Fields.batchNumber;
      // this.model.expiryForDisplay = this.gs1Fields.expiry.slice(0, 2) === "00" ? this.gs1Fields.expiry.slice(5) : this.gs1Fields.expiry;
      let expireDateConverted;

      if (this.gs1Fields.expiry.slice(0, 2) === "00") {
        this.model.expiryForDisplay = this.gs1Fields.expiry.slice(5);
        //convert date to last date of the month for 00 date
        expireDateConverted = this.gs1Fields.expiry.replace("00", "01");
        expireDateConverted = new Date(expireDateConverted.replaceAll(' ', ''));
        expireDateConverted.setFullYear(expireDateConverted.getFullYear(), expireDateConverted.getMonth() + 1, 0);
        expireDateConverted = expireDateConverted.getTime();
      } else {
        this.model.expiryForDisplay = this.gs1Fields.expiry;
        expireDateConverted = this.model.expiryForDisplay.replaceAll(' ', '');
      }

      this.model.expireDateConverted = expireDateConverted;
    }

    const basePath = utils.getMountPath(this.gtinSSI, this.gs1Fields);
    this.dsuDataRetrievalService = new DSUDataRetrievalService(this.gtinSSI);
    this.model.SNCheckIcon = constants.SN_OK_ICON;
    this.setColor('serialNumberVerification', '#7eba7e');

    this.model.PSCheckIcon = constants.PRODUCT_STATUS_OK_ICON;
    this.setColor('productStatusVerification', '#7eba7e');

    this.model.PVIcon = constants.PACK_VERIFICATION_ICON;
    this.setColor('packageVerification', 'orange');

    const smpcDisplayService = new XMLDisplayService(this.DSUStorage, element, this.gtinSSI, basePath, "smpc", "smpc.xml", this.model);
    const leafletDisplayService = new XMLDisplayService(this.DSUStorage, element, this.gtinSSI, basePath, "leaflet", "smpc.xml", this.model);

    smpcDisplayService.isXmlAvailable();
    leafletDisplayService.isXmlAvailable();


    this.on("view-leaflet", () => {
      this.navigateToPageTag("leaflet", {
          gtinSSI: this.gtinSSI,
          gs1Fields: this.gs1Fields,
          titleLabel: this.model.product.patientLeafletInfo
      });
    });

    element.querySelectorAll("[disabled]").forEach(node => {
      node.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true)
    });

    this.on("view-smpc", () => {
      this.navigateToPageTag("smpc", {
          gtinSSI: this.gtinSSI,
          gs1Fields: this.gs1Fields,
          titleLabel: this.model.product.practitionerInfo
      });
    });

    this.on("report", () => {
      /*
            history.push({
              pathname: `${new URL(history.win.basePath).pathname}report`,
              state: {
                gtinSSI: this.gtinSSI,
                gs1Fields: this.gs1Fields
              }
            });
      */

      this.navigateToPageTag("report", {
          gtinSSI: this.gtinSSI,
          gs1Fields: this.gs1Fields
      });
    });

    this.dsuDataRetrievalService.readProductData((err, product) => {
      if (err) {
        return console.log(err);
      }

      if (typeof product === "undefined") {
        return;
      }

      if (!product.antiCounterfeitingEnabled) {
        this.model.displayItems--;
        this.model.secondRowColumns--;
        this.element.querySelector("#package-verification-item").hidden = true;
        this.model.showVerifyPackageButton = false;
        this.element.querySelector("[condition=showVerifyPackageButton]").hidden = true;
      }

      if (!product.adverseEventsReportingEnabled) {
        this.model.secondRowColumns--;
        this.model.showReportButton = false;
        this.element.querySelector("[condition=showReportButton]").hidden = true;
      }

      this.model.product = product;
      this.dsuDataRetrievalService.readBatchData((err, batchData) => {
        if (err || typeof batchData === "undefined") {
          this.updateUIInGTINOnlyCase();
          if (this.model.product.gtin && this.model.product.showEPIOnUnknownBatchNumber) {
            this.model.showEPI = true;
          }
          return console.log(err);
        }

        //serial number data validation item is not displayed
        if (!batchData.serialCheck) {
          this.model.displayItems--;
          this.element.querySelector("#serial-number-validation-item").hidden = true;
        }
        //expiration date validation item is not displayed
        if (!batchData.incorrectDateCheck || !batchData.expiredDateCheck) {
          this.model.displayItems--;
          this.element.querySelector("#date-validation-item").hidden = true;
        }

        if (batchData.defaultMessage || batchData.recalled) {

          this.showModalFromTemplate('batch-info', () => {
          }, () => {
          }, {
            model: {
              title: "Note",
              recallMessage: batchData.recalled ? batchData.recalledMessage : "",
              defaultMessage: batchData.defaultMessage
            }, disableExpanding: true
          });
        }

        let checkSNCheck = () => {
          let res = {
            validSerial: false,
            recalledSerial: false,
            decommissionedSerial: false
          };
          const serialNumberType = this.getSerialNumberType(this.model.serialNumber, batchData.bloomFilterSerialisations);
          switch (serialNumberType){
            case "valid":
              res.validSerial = true;
              return res;
            case "recalled":
              res.recalledSerial = true;
              return res;
            case "decommissioned":
              res.decommissionedSerial = true;
              return res;
            default:
              if (batchData.recalled) {
                res.recalledSerial = true;
              }
              return res;
          }
        };
        const showError = (message) => {
          this.model.serialNumberVerification = message;
          this.model.SNCheckIcon = constants.SN_FAIL_ICON;
          this.setColor('serialNumberVerification', 'red');
        }

        batchData.expiryForDisplay = utils.convertFromGS1DateToYYYY_HM(batchData.expiry);
        batchData.expiryForDisplay = batchData.expiryForDisplay.slice(0, 2) === "00" ? batchData.expiryForDisplay.slice(5) : batchData.expiryForDisplay;
        this.model.batch = batchData;
        let snCheck = checkSNCheck();
        let expiryCheck = this.model.expiryForDisplay === batchData.expiryForDisplay;
        let expiryTime;
        try {
          expiryTime = new Date(this.model.expireDateConverted).getTime();
        } catch (err) {
          // do nothing
        }
        const currentTime = Date.now();
        this.model.showEPI = this.leafletShouldBeDisplayed(product, batchData, snCheck, expiryCheck, currentTime, expiryTime);

        if (!snCheck.validSerial && batchData.serialCheck) {
          showError(constants.SN_FAIL_MESSAGE)
        }

        if (snCheck.recalledSerial) {
          if (batchData.recalled) {
            this.model.serialNumberLabel = "Batch";
          }
          showError(constants.SN_RECALLED_MESSAGE);
        }

        if (snCheck.decommissionedSerial) {
          const reasonMsg = batchData.decommissionReason ? ' reason: ' + batchData.decommissionReason : "";
          showError(constants.SN_DECOMMISSIONED_MESSAGE + reasonMsg);
        }

        if (!expiryCheck && batchData.incorrectDateCheck) {
          this.model.productStatus = constants.PRODUCT_STATUS_FAIL_MESSAGE;
          this.model.PSCheckIcon = constants.PRODUCT_STATUS_FAIL_ICON;
          this.setColor('productStatusVerification', 'red');
          return;
        }

        console.log(currentTime, expiryTime);
        if (expiryTime && expiryTime < currentTime && batchData.expiredDateCheck) {
          this.model.productStatus = constants.PRODUCT_EXPIRED_MESSAGE;
          this.model.PSCheckIcon = constants.PRODUCT_STATUS_FAIL_ICON;
          this.setColor('productStatusVerification', 'red');
        }
      });
    });
  }

  updateUIInGTINOnlyCase() {
    const message = "The batch number in the barcode could not be found";
    this.displayModal(message, " ");
    this.model.serialNumberVerification = constants.SN_UNABLE_TO_VERIFY_MESSAGE;
    this.model.SNCheckIcon = constants.SN_GRAY_ICON
    this.model.productStatus = constants.PRODUCT_STATUS_UNABLE_TO_VALIDATE_MESSAGE;
    this.model.PSCheckIcon = constants.PRODUCT_STATUS_GRAY_ICON;
    this.model.packageVerification = constants.PACK_VERIFICATION_UNABLE_TO_VERIFY_MESSAGE;
    this.model.PVIcon = constants.PACK_VERIFICATION_GRAY_ICON;

    this.setColor("serialNumberVerification", "#cecece");
    this.setColor("productStatusVerification", "#cecece");
    this.setColor("packageVerification", "#cecece");
  }

  setColor(id, color) {
    let el = this.element.querySelector('#' + id);
    el.style.color = color;
  }

  getSerialNumberType(serialNumber, bloomFilterSerialisations) {
    if (typeof serialNumber === "undefined" || typeof bloomFilterSerialisations === "undefined" || bloomFilterSerialisations.length === 0) {
      return false;
    }
    let createBloomFilter;
    try {
      createBloomFilter = require("opendsu").loadAPI("crypto").createBloomFilter;
    } catch (err) {
      return alert(err.message);
    }

    for (let i = bloomFilterSerialisations.length - 1; i >= 0; i--) {
      let bf = createBloomFilter(bloomFilterSerialisations[i].serialisation);
      if (bf.test(serialNumber)) {
        return bloomFilterSerialisations[i].type;
      }
    }

    return undefined;
  }

  leafletShouldBeDisplayed(product, batchData, snCheck, expiryCheck, currentTime, expiryTime) {
    //fix for the missing case describe here: https://github.com/PharmaLedger-IMI/epi-workspace/issues/167
    if (batchData.serialCheck && !snCheck.validSerial && !snCheck.recalledSerial && !snCheck.decommissionedSerial && product.showEPIOnSNUnknown) {
      return true;
    }

    if (batchData.serialCheck && typeof this.model.serialNumber === "undefined" && product.showEPIOnSNUnknown) {
      return true;
    }

    if (batchData.serialCheck && snCheck.recalledSerial && (product.showEPIOnBatchRecalled || product.showEPIOnSNRecalled)) {
      return true;
    }

    if (batchData.serialCheck && snCheck.decommissionedSerial && product.showEPIOnSNDecommissioned) {
      return true;
    }

    if (!batchData.expiredDateCheck && !batchData.incorrectDateCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.expiredDateCheck && currentTime < expiryTime && !batchData.incorrectDateCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.expiredDateCheck && expiryTime < currentTime && product.showEPIOnBatchExpired && !batchData.incorrectDateCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.incorrectDateCheck && !expiryCheck && !batchData.serialCheck && product.showEPIOnIncorrectExpiryDate && !batchData.serialCheck) {
      return true;
    }

    if (!batchData.expiredDateCheck && batchData.incorrectDateCheck && expiryCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.expiredDateCheck && currentTime < expiryTime && batchData.incorrectDateCheck && expiryCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.expiredDateCheck && expiryTime < currentTime && product.showEPIOnBatchExpired && batchData.incorrectDateCheck && expiryCheck && !batchData.serialCheck) {
      return true;
    }

    if (batchData.expiredDateCheck && currentTime < expiryTime && !batchData.incorrectDateCheck && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    if (batchData.expiredDateCheck && expiryTime < currentTime && product.showEPIOnBatchExpired && !batchData.incorrectDateCheck && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    if (batchData.expiredDateCheck && currentTime < expiryTime && batchData.incorrectDateCheck && expiryCheck && batchData.serialCheck && snCheck.validSerial && batchData.recalled && product.showEPIOnBatchRecalled) {
      return true;
    }

    if (batchData.expiredDateCheck && currentTime < expiryTime && batchData.incorrectDateCheck && expiryCheck && batchData.serialCheck && snCheck.validSerial && !batchData.recalled) {
      return true;
    }

    if (batchData.expiredDateCheck && expiryTime < currentTime && product.showEPIOnBatchExpired && batchData.incorrectDateCheck && expiryCheck
      && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    if (batchData.incorrectDateCheck && !expiryCheck && product.showEPIOnIncorrectExpiryDate && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    if (!batchData.expiredDateCheck && !batchData.incorrectDateCheck && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    if (!batchData.expiredDateCheck && batchData.incorrectDateCheck && expiryCheck && batchData.serialCheck && snCheck.validSerial) {
      return true;
    }

    return false;
  }
}
