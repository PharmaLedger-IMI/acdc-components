const {ACDC_STATUS} = require('../constants')

module.exports = class ScanResult{
    snCheckResult;
    mahId;
    acdcStatus = ACDC_STATUS.DISABLED;
    err;

    constructor(props){
        for(let prop in props)
            if (this.hasOwnProperty(prop))
                this[prop] = props[prop];
    }
}