module.exports = class ScanEvent {
    productCode;
    batch;
    serialNumber;
    expiryDate;
    snCheckDateTime;

    // user optional
    snCheckLocation;
    did;

    // optional
    batchDsuStatus;
    productDsuStatus;

    constructor(gs1Data){
        this.batch = gs1Data.batchNumber;
        this.productCode = gs1Data.gtin;
        this.expiryDate = gs1Data.expiry; // no format conversion (a wrong date format is also an indicator of something)
        this.serialNumber = gs1Data.serialNumber;
        this.snCheckDateTime = Date.now();
    }

    _bindUserDetails(did, location){
        this.did = did;
        this.snCheckLocation = location;
    }

    setBatchDSUStatus(status){
        this.batchDsuStatus = status;
    }

    setProductDSUStatus(status){
        this.productDsuStatus = status;
    }

    /**
     * Reports the event to ACDC via {@link ReportingService#_report}
     * @param {function(err, response)} [callback]
     */
    report(callback){}
}