const {WebcController} = WebCardinal.controllers;
import utils from "../../utils.js";
import constants from "../../constants.js";
import getStorageService from "../services/StorageService.js";
import SettingsService from "../services/SettingsService.js";

export default class AuthFeatureController extends WebcController {
    constructor(element, history, ...args) {
        super(element, history, ...args);
        if (!history.location.state)
            return console.log(`ERROR: No state found for Auth Feature`);
        const {ssi, gs1Fields, gtinSSI, acdc} = history.location.state;
        this.model = {
            ssi: ssi,
            gtinSSI: gtinSSI,
            gs1Fields: gs1Fields,
            acdc: acdc
        };

        this.settingsService = new SettingsService(this.DSUStorage);
        this.acdc = require('acdc').ReportingService.getInstance(this.settingsService);
        this.dbStorage = getStorageService();

        this.on('windowAction', this.receiveAuthResponse.bind(this));
    }

    receiveAuthResponse(evt){
        evt.preventDefault();
        evt.stopImmediatePropagation();
        const authResponse = evt.detail;
        const self = this;

        self.storeResults(authResponse, (err) => {
            if (err)
                console.log(`Failed to store auth feature results`);
            self.report(authResponse, (err) => {
                if (err)
                    console.log(`failure to report to acdc`);
                self.returnToDetails(authResponse);
            });
        });
    }

    returnToDetails(authResponse){
        this.model.ssi = ''
        const acdc = Object.assign({}, this.model.acdc, {
            authResponse : authResponse
        })
        this.navigateToPageTag('drug-details', {
            gs1Fields: Object.assign({}, this.model.gs1Fields),
            gtinSSI: this.model.gtinSSI,
            acdc: acdc
        });
    }

    storeResults(authResponse, callback){
        const self = this;
        const pk = utils.getRecordPKey(self.model.gtinSSI, Object.assign({}, self.model.gs1Fields));
        self.dbStorage.getRecord(constants.HISTORY_TABLE, pk, (err, record) => {
            if (err)
                return callback(err);
            record.acdc = Object.assign(record.acdc, {
                authResponse: authResponse
            });

            self.dbStorage.updateRecord(constants.HISTORY_TABLE, pk, record, (err) => {
                if (err)
                    return callback(err);
                callback(undefined);
            });
        });
    }

    report(authResponse, callback){
        const evt = this.acdc.createScanEvent(Object.assign({}, this.model.gs1Fields, {
            previousScan: this.model.acdc.eventId,
            authResponse: authResponse
        }));
        evt.report((err) => {
            if (err)
                console.log(`failed to report to acdc`, err);
            callback();
        });
    }
}
