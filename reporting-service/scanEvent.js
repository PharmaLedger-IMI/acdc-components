module.exports = class ScanEvent {
    gtin;
    batch;
    serialNumber;
    expireDate;
    snCheckDateTime;

    // user optional
    snCheckLocation;
    did;
    // optional
    // batchdsustatus
    // productdsustatus

    constructor(gs1Data){
        this.batch = gs1Data.batchNumber;
        this.gtin = gs1Data.gtin;
        this.expireDate = Date.parse(gs1Data.expiry);
        this.serialNumber = gs1Data.serialNumber;
        this.snCheckDateTime = Date.now();
    }

    bindUserAndLocation(did, location){
        this.did = did;
        this.snCheckLocation = location;
    }
}