import constants from "../../constants.js";

class ACDCReportingService {
    constructor() {
        this.openDSU = require('opendsu');
    }

    report(){

    }
}

let acdc;

export default function getACDC(){
    if (!acdc)
        acdc = new ACDCReportingService();
    return acdc;
}

