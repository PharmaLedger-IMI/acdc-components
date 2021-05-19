const {SETTINGS, ENDPOINT} = require('./constants');

const formatDate = function(date){
    return date.split('-').map(s => s.trim().slice(-2)).reverse().join('');
}

class ScanEvent {
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
        this.expiryDate = formatDate(gs1Data.expiryDate); // 10 - 12 - 2342 -> YYMMDD
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


class ReportingService {
    constructor(dsuStorage, settingsService) {
        this.storage = dsuStorage;
        this.settingsService = settingsService;
        this.http = require('opendsu').loadApi('http');
    }

    /**
     * Returns the model object to represent the checkboxes in cardinal
     * @param {string} name
     * @param {string} label the general label
     * @param {string} checkboxLabel the checkbox's label
     * @param {*} value
     * @return {{}}
     * @private
     */
    _getCheckboxModel(name, label, checkboxLabel, value){
        return {
            label: label,
            name: name,
            checkboxLabel: checkboxLabel,
            checkedValue: true,
            uncheckedValue: false,
            value: value
        }
    }

    /**
     * Returns the model object to represent the checkboxes in cardinal
     * @param {string} label the general label
     * @param {string} placeholder the dropdown's placeholder
     * @param {boolean} required
     * @param {{}[]} options in {label: '...', value: '...'} format
     * @param {string} value
     * @return {{}}
     * @private
     */
    _getDropdownModel(label, placeholder, required,  options, value){
        return {
            label: label,
            placeholder: 'Please select one option...',
            required: required,
            options: options,
            value: value
        }
    }

    /**
     * Adds the ACDC settings model to the provided model
     * @param model
     * @param callback
     */
    setSettingsToModel(model, callback){
        const self = this;
        model.acdc = model.acdc || {};

        self.settingsService.readSetting(SETTINGS.enableAcdc, (err, acdcSetting) => {
            acdcSetting = !(err || !acdcSetting || acdcSetting !== 'true');

            // model.acdc.enabled = self._getCheckboxModel("input-acdc-enabled",
            //     "Please contribute to fraud prevention by sharing unidentified data!",
            //     "Enabled Anti-Counterfeiting checks?",
            //     acdcSetting);

            model.acdc.enabled = self._getDropdownModel("Enable Anti-Counterfeit Validation?"
                                                        , undefined, true, [
                    {label: "Yes", value: "true"},
                    {label: "No", value: "false"}
                ], acdcSetting + '');

            self.settingsService.readSetting(SETTINGS.didKey, (err, didSetting) => {
                didSetting = !(err || !didSetting || didSetting !== "true");
                //
                // model.acdc.did = self._getCheckboxModel("input-acdc-did",
                //     "Please help us prevent fraud by sharing an untraceable identifier",
                //     "Share Decentralized Identity?",
                //     didSetting);

                model.acdc.did = self._getDropdownModel("Share de-identified marker for Anti-Counterfeiting purposes?"
                    , undefined, true, [
                        {label: "Yes", value: "true"},
                        {label: "No", value: "false"}
                    ], didSetting + '');

                self.settingsService.readSetting(SETTINGS.locationKey, (err, locationSetting) => {
                    locationSetting = !(err || !locationSetting || locationSetting !== "true");
                    // model.acdc.location = self._getCheckboxModel("input-acdc-location",
                    //     "Please help us identify counterfeit drugs by sharing your location",
                    //     "Share location?",
                    //     locationSetting);

                    model.acdc.location = self._getDropdownModel("Share location when scanning for Anti-Counterfeiting purposes?"
                        , undefined, true, [
                            {label: "Yes", value: "true"},
                            {label: "No", value: "false"}
                        ], locationSetting + '');

                    self._bindModelChangeEvents(model);
                    callback();
                })
            });
        });
    }

    /**
     * Generates a random DID for the app to report to acdc
     * @private
     */
    _generateDID(){
        const newDID = require('opendsu').loadApi('crypto').generateRandom(256);
        console.log(`Random new DID generated: ${newDID}`);
        return newDID;
    }

    /**
     * How will this work with mobile? needs native gps api?
     * @param callback
     * @return {*}
     * @private
     */
    _getPosition(callback){
        if (!navigator)
            return callback(`Geolocation does not seem to be available. Are you on a web browser?`);
        if (!navigator.geolocation)
            return callback(`Geolocation feature unexisting or disabled`);

        const handleError = function(error){
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    return callback("User denied the request for Geolocation.");
                case error.POSITION_UNAVAILABLE:
                    return callback("Location information is unavailable.");
                case error.TIMEOUT:
                    return callback("The request to get user location timed out.");
                default:
                    return callback("An unknown error occurred.");
            }
        }

        navigator.geolocation.getCurrentPosition((pos) =>
            callback(undefined, {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                altitude: pos.coords.altitude,
                accuracy: pos.coords.accuracy,
                altitudeAccuracy: pos.coords.altitudeAccuracy
            }), handleError);
    }

    /**
     * Binds the listeners for the model change event to properly update the settings
     * @param model
     * @private
     */
    _bindModelChangeEvents(model){
        const self = this;

        model.onChange("acdc.did.enabled", () => {
            self.settingsService.writeSetting(SETTINGS.enableAcdc, model.acdc.enableAcdc.value === 'true', (err) => {
                if (err)
                    console.log(`Could not update ${SETTINGS.enableAcdc} in settings`, err);
            });
        });

        model.onChange("acdc.did.value", () => {
            self.settingsService.writeSetting(SETTINGS.didKey, model.acdc.did.value === 'true' ? self._generateDID() : false, (err) => {
                if (err)
                    console.log(`Could not update ${SETTINGS.didKey} in settings`, err);
            });
        });

        model.onChange("acdc.location.value", () => {
            self.settingsService.writeSetting(SETTINGS.locationKey, model.acdc.location.value === 'true', (err) => {
                if (err)
                    console.log(`Could not update ${SETTINGS.locationKey} in settings`, err);
            });
        });
    }

    /**
     * This needs to read:
     *  - user did;
     *  - location;
     * when user has given access
     * @private
     */
    _bindUserDetails(event, callback){
        const self = this;

        const doDID = function(callback){
            self.settingsService.readSetting(SETTINGS.didKey, (err, did) => {
                if (err || !did)
                    return callback(undefined, undefined);
                callback(undefined, did);
            });
        }

        const doLocation = function(callback){
            self.settingsService.readSetting(SETTINGS.locationKey, (err, location) => {
                if (err || !location)
                    return callback(undefined, undefined);
                self._getPosition((err, position) => {
                    if (err){
                        console.log(err);
                        return callback(undefined, event);
                    }
                    callback(undefined, position);
                });
            });
        }

        doDID((err, did) => {
            if (err)
                return callback(err);
            doLocation((err, location) => {
                if (err)
                    return callback(err);
                event._bindUserDetails(did, location);
                callback(undefined, event);
            });
        });
    }

    createScanEvent(scanData){
        const event = new ScanEvent(scanData);
        event.report = (cb) => this._report.call(this, event, cb);
        return event;
    }

    _report(evt, callback){
        const self = this;

        callback = callback || function(err, result){
            if (err)
                return console.log(err);
            console.log(JSON.stringify(result));
        }

        this._bindUserDetails(evt, (err, boundEvt) => {
            if (err)
                return callback(`Could not bind user details`);
            self.http.doPost(ENDPOINT, JSON.stringify(boundEvt), callback);
        });
    }
}

let reportingService;

const getAcdc = function(dsuStorage, settingsServices){
    if (!reportingService)
        reportingService = new ReportingService(dsuStorage, settingsServices);
    return reportingService;
}

module.exports = {
    getAcdc
};

