import utils from "../utils.js";

const defaultPhoto = utils.getFetchUrl("/download/code/assets/images/default.png");
export default class Product {
  name = "";
  gtin = "";
  photo = defaultPhoto;
  description = "";
  leaflet = "";
  manufName = "";
  version = 1;
  previousVersion = 1;
  files = [];
  transferred = false;
  // START acdc patch
  reportURL = `${window.top.location.origin}/borest/scan`;
  antiCounterfeitingURL = `${window.top.location.origin}/borest/scan`;
  // END acdc patch
  isCodeEditable = true;
  adverseEventsReportingEnabled = true;
  antiCounterfeitingEnabled = true;
  showEPIOnBatchRecalled = false;
  showEPIOnUnknownBatchNumber = true;
  showEPIOnSNRecalled = false;
  showEPIOnSNDecommissioned = false;
  showEPIOnSNUnknown = false;
  showEPIOnIncorrectExpiryDate = false;
  showEPIOnBatchExpired = true;
  practitionerInfo = "SmPC";
  patientLeafletInfo = "Patient Information";
  strength = "";
  internalMaterialCode = "";
  imagePath;
  markets = [];

  constructor(product) {
    if (typeof product !== undefined) {
      for (let prop in product) {
        this[prop] = product[prop];
      }
    }

    if (this.gtin === "") {
      this.gtin = '05290931025615';
    }
  }

  validate() {
    const errors = [];
    if (!this.name) {
      errors.push('Name is required.');
    }

    if (!this.gtin) {
      errors.push('GTIN is required.');
    }

    return errors.length === 0 ? true : errors;
  }

  generateViewModel() {
    return {label: this.name, value: this.gtin}
  }

  clone() {
    return new Product(JSON.parse(JSON.stringify(this)));
  }

  addMarket(market) {
    this.markets.push(market);
  }

  getMarket(marketId) {
    const market = this.markets.find(elem => elem.marketId === marketId);
    return market;
  }

  updateMarket(elementId, value) {
    const index = this.markets.findIndex(elem => elem.marketId === elementId);
    if (index !== -1) {
      this.markets[index] = value;
    }
  }

  removeMarket(marketId) {
    for (let i = 0; i < this.markets.length; i++) {
      if (this.markets[i].marketId === marketId) {
        this.markets.splice(i, 1);
        break;
      }
    }
  }

  hasPhoto() {
    return typeof this.photo !== "undefined" && this.photo !== defaultPhoto;
  }
}
