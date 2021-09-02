const {WebcController} = WebCardinal.controllers;

export default class AuthFeatureController extends WebcController {
    constructor(element, history, ...args) {
        super(element, history, ...args);
        if (!history.location.state)
            return console.log(`ERROR: No state found for Auth Feature`);
        const {ssi, gs1Fields} = history.location.state;
        this.model.ssi = ssi;
        this.model.gs1Fields = gs1Fields;
    }
}
