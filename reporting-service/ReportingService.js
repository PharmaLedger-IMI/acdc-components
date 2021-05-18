const ScanEvent = require('./scanEvent');
const {SETTINGS} = require('./constants');

class ReportingService {
    constructor(dsuStorage, settingsService) {
        // this.openDSU = require('opendsu');
        this.storage = dsuStorage;
        this.settingsService = settingsService;
    }

    _getCheckbox(name, label, checkboxLabel, value){
        return {
            label: label,
            name: name,
            checkboxLabel: checkboxLabel,
            checkedValue: true,
            uncheckedValue: false,
            value: value
        }
    }

    getSettingsForDisplay(model, callback){
        const self = this;
        model.acdc = model.acdc || {};

        self.settingsService.readSetting(SETTINGS.didKey, (err, didSetting) => {
            if (err || !didSetting)
                didSetting = false

            model.acdc.did = self._getCheckbox("input-acdc-did",
                "Please help us prevent fraud by sharing an untraceable identifier",
                "Share Decentralized Identity?",
                didSetting);

            self.settingsService.readSetting(SETTINGS.locationKey, (err, locationSetting) => {
                if (err || !locationSetting)
                    locationSetting = false;
                model.acdc.location = self._getCheckbox("input-acdc-location",
                    "Please help us identify counterfeit drugs by sharing your location",
                    "Share location?",
                    locationSetting);

                self._bindModelChangeEvents(model);
                callback();
            })

        });
    }

    _bindModelChangeEvents(model){
        const self = this;
        model.onChange("acdc.did", () => {
            self.settingsService.writeSetting(SETTINGS.didKey, model.acdc.did.value, (err) => {
                if (err)
                    console.log(`Could not update ${SETTINGS.didKey} in settings`, err);
            });
        });

        model.onChange("acdc.location", () => {
            self.settingsService.writeSetting(SETTINGS.locationKey, model.acdc.location.value, (err) => {
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
        callback(undefined, event);
    }

    report(scanData, callback){
        const scanEvent = new ScanEvent(scanData);
        this._bindUserDetails(scanEvent, (err, boundEvent) => {
            if (err)
                return callback(err);

        });
    }
}

let acdc;

function getACDC(dsuStorage){
    if (!acdc){
        if (!dsuStorage)
            throw new Error("No DSU Storage Provided");
        acdc = new ReportingService(dsuStorage);
    }

    return acdc;
}

module.exports = getACDC;

