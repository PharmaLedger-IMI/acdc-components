const ENDPOINT = 'http://127.0.0.1:3000/borest/scan';
const API_HUB_ENDPOINT = '/acdc/scan#x-blockchain-domain-request'; // the '#x-blockchain-domain-request' fragment is needed to bypass the service worker
const HEADERS = {
    headers: {
        'content-type': 'application/json; charset=utf-8'
    }
};

const SETTINGS = {
    enableAcdc: 'acdc-enabled',
    didKey: 'acdc-did',
    locationKey: 'acdc-location'
}

const ACDC_STATUS = {
    UP: "up",
    DOWN: "down",
    DISABLED: "disabled"
}

module.exports = {
    ENDPOINT,
    API_HUB_ENDPOINT,
    HEADERS,
    SETTINGS,
    ACDC_STATUS
}