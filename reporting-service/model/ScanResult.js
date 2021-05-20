const {ACDC_STATUS} = require('../constants')

module.exports = class ScanResult{
    snCheckResult;
    mahId;
    acdcStatus = ACDC_STATUS.DISABLED;
    err;

    constructor(props){
        if (!!props)
            for(let prop in props)
                if (props.hasOwnProperty(prop))
                    this[prop] = props[prop];
    }
}