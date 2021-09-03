const {WebcController} = WebCardinal.controllers;

export default class AuthFeatureController extends WebcController {
    constructor(element, history, ...args) {
        super(element, history, ...args);
        if (!history.location.state)
            return console.log(`ERROR: No state found for Auth Feature`);
        const {ssi, gs1Fields, gtinSSI} = history.location.state;
        this.model = {
            ssi: ssi,
            gtinSSI: gtinSSI
        };

        this.model.gs1Fields = gs1Fields;

        this.on('windowAction', this.receiveAuthResponse.bind(this));
    }

    receiveAuthResponse(evt){
        evt.preventDefault();
        evt.stopImmediatePropagation();
        const ssi = this.model.ssi;
        this.model.ssi = ''
        this.navigateToPageTag('drug-details', {
            gs1Fields: Object.assign({}, this.model.gs1Fields),
            gtinSSI: this.model.gtinSSI,
            authFeature: Object.assign({
                ssi: ssi,
            }, evt.detail)
        })
    }
}
