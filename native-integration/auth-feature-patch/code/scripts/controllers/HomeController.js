import interpretGS1scan from "../utils/interpretGS1scan/interpretGS1scan.js";

const {WebcController} = WebCardinal.controllers;

class AuthFeatureError {
    code = 0;
    message = undefined;

    constructor(error){
        if (typeof error === 'string'){
            this.code = 1;
            this.message = error;
        } else {
            this.code = error.code;
            this.message = error.message;
        }
    }
}

class AuthFeatureResponse  {
    status = false;
    error = undefined;

    constructor(status, error) {
        this.status = status;
        this.error = error ? new AuthFeatureError(error) : undefined;
    }
}

/**
 * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 * @param query
 * @returns {*}
 */
const getQueryStringParams = () => {

    const parseQuery = function(query){
        return query.split("?").slice(1).join('?')
    }

    const query = parseQuery(window.frameElement.src);
    return query
        ? (/^[?#]/.test(query) ? query.slice(1) : query)
            .split('&')
            .reduce((params, param) => {
                    let [key, value] = param.split('=');
                    params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                    return params;
                }, {}
            )
        : {}
};

const getProductInfo = function(gtin, callback){
    const gtinResolver = require('gtin-resolver');
    const keySSI = gtinResolver.createGTIN_SSI('epi', 'epi', gtin);
    const resolver = require('opendsu').loadApi('resolver');
    resolver.loadDSU(keySSI, (err, dsu) => {
        if (err)
            return callback(err);
        dsu.readFile('product/product.json', (err, product) => {
            if (err)
                return callback(err);
            try{
                product = JSON.parse(product);
            } catch (e) {
                return callback(e);
            }
            callback(undefined, product);
        });
    })
}

const getBatchInfo = function(gtin, batchNumber,  callback){
    const gtinResolver = require('gtin-resolver');
    const keySSI = gtinResolver.createGTIN_SSI('epi', 'epi', gtin, batchNumber);
    const resolver = require('opendsu').loadApi('resolver');
    resolver.loadDSU(keySSI, (err, dsu) => {
        if (err)
            return callback(err);
        dsu.readFile('batch/batch.json', (err, batch) => {
            if (err)
                return callback(err);
            try{
                batch = JSON.parse(batch);
            } catch (e) {
                return callback(e);
            }
            callback(undefined, batch);
        });
    })
}

export default class HomeController extends WebcController{
    constructor(element, history, ...args) {
        super(element, history, ...args);
        const gs1Data = getQueryStringParams();
        this.model.gs1Data = gs1Data;
        this.barcodeScannerController = this.element.querySelector('pdm-barcode-scanner-controller');
        const self = this;

        this.onTagClick('scan', self.verifyPack.bind(self));

        this.onTagClick('native', () => {
            this.navigateToPageTag('native');
        })

        getProductInfo(gs1Data.gtin, (err, product) => {
            if (err)
                console.log(`Could not read product info`, err);
            else
                self.model.product = product;
            getBatchInfo(gs1Data.gtin, gs1Data.batchNumber, (err, batch) => {
                if (err)
                    console.log(`Could not read batch data`, err);
                else
                    self.model.batch = batch;
            });
        });
    }

    async verifyPack(){
        const self = this;

        const showError = function(error){
            self.showErrorModal("Authentication Feature", error.message || error);
        }

        await self.scanCode((err, scanData) => {
            if (err)
                return showError(`Could not scan Pack`);
            if (!scanData)
                return console.log(`No data scanned`);
            const isValid = self.verify(scanData);
            self.report(isValid, isValid ? undefined : "Package is not valid");
        });
    }

    async scanCode(callback){
        const self = this;
        await self.barcodeScannerController.present((err, scanData) => err
                ? callback(err)
                : callback(undefined, scanData ? self.parseScanData(scanData.result) : scanData));
    }

    parseScanData(result){
        const interpretedData = interpretGS1scan.interpretScan(result);
        const data = interpretedData.AIbrackets.split(/\(\d{1,2}\)/g);
        result = {
            gtin: data[1],
            expiry: data[2],
            batchNumber: data[3],
            serialNumber: data[4]
        }
        return result;
    }

    verify(scanData){
        const self = this;
        return Object.keys(scanData).every(key => {
            if (key === 'expiry'){
                const dateA = new Date(scanData[key].replace(/(\d{2})(\d{2})(\d{2})/g,'$2/$3/$1')).getTime();
                const dateB = new Date(self.model.gs1Data[key].replaceAll(" - ", "/")).getTime();
                return dateA === dateB;
            }
            return scanData[key] === self.model.gs1Data[key];
        });
    }

    report(status, error){
        const event = new CustomEvent('ssapp-action', {
            bubbles: true,
            cancelable: true,
            detail: new AuthFeatureResponse(status, error)
        });
        this.element.dispatchEvent(event);
    }
}