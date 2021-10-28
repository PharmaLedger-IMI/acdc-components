const {ACDC_STATUS, HEADERS} = require('../constants');
const ScanResult = require('../model/ScanResult');
const {constants} = require('../../epi-utils/lib/utils');

/**
 * Reads the request body and parses it to JSON format
 * @param req
 * @param callback
 */
const parseRequestBody = function(req, callback){
    const data = [];

    req.on('data', (chunk) => {
        data.push(chunk);
    });

    req.on('end', () => {
        try {
            req.body = data.length ? JSON.parse(data) : {};
        } catch (e) {
            return callback(e);
        }
        callback(undefined, req.body);
    });
}

/**
 * In order to bypass CORS, we need the app to perform a call to its apihub that will
 * then be relayed to the ACDC server
 * @param {Server} server
 */
function startACDCMiddleware(server){
    const opendsu = require('opendsu');
    const http = opendsu.loadApi('http');


    server.post(`/acdc/scan`, (req, res) => {

        const sendResponse = function(response, code = 200){
            response.statusCode = code;
            res.write(JSON.stringify(response));
            res.end();
        }

        parseRequestBody(req, (err, event) => {
            if (err)
                return sendResponse(new ScanResult({acdcStatus: undefined, err: `Error parsing input ${req.body}: ${err}`}));

            if (event.batchDsuStatus || event.productDsuStatus){
                const resolver = opendsu.loadApi('resolver');
                const keyssi = onepdsu.loadApi('keyssi');

                const productSSI = keyssi.createArraySSI('epi', [event.productCode]);

                const errCb = () => sendResponse(new ScanResult({acdcStatus: undefined, err: `Could not find reference to the reporting URL: ${err}`}));


                resolver.loadDSU(productSSI, (err, dsu) => {
                    if (err)
                        return errCb();

                    dsu.readFile(constants['PRODUCT_STORAGE_FILE'], (err, product) => {
                        if (err)
                            return errCb();
                        try {
                            product = JSON.parse(product);
                        } catch (e) {
                            return errCb();
                        }

                        const endpoint = product.reportURL;
                        if (!endpoint)
                            return errCb();

                        http.doPost(endpoint, JSON.stringify(event), HEADERS, (err, result) => {
                            if (err)
                                return sendResponse(new ScanResult({acdcStatus: ACDC_STATUS.DOWN, err: err}));
                            result = typeof result === 'string' ? JSON.parse(result) : result;
                            return sendResponse(new ScanResult({...result, acdcStatus: ACDC_STATUS.UP}));
                        });
                    });
                });
            }
        });
    });
}


module.exports = startACDCMiddleware;