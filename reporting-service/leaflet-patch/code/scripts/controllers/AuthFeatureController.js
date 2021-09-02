const {WebcController} = WebCardinal.controllers;

export default class AuthFeatureController extends WebcController {
    constructor(...args) {
        super(...args);
        console.log(`AuthFeature Controller`, ...args);
    }
}
