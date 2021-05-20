const {ENDPOINT, ACDC_STATUS, HEADERS} = require('../constants');
const ScanResult = require('../model/ScanResult');

const parseRequestBody = function(req, callback){
    const data = [];

    req.on('data', (chunk) => {
        data.push(chunk);
    });

    req.on('end', () => {
        try {
            req.body = data.length ? JSON.parse(data) : {};
        } catch (e) {
            callback(e);
        }
        callback(undefined, req.body);
    });
}


function startACDCMiddleware(server){
    const http = require('opendsu').loadApi('http');

    server.post(`/acdc/scan`, (req, res, next) => {

        parseRequestBody(req, (err, event) => {
            if (err)
                return console.log(`Error parsing body: ${err}`);

            const sendResponse = function(response){
                res.status(200);
                res.send(JSON.stringify(response));
                res.end();
            }

            http.doPost(ENDPOINT, JSON.stringify(event), HEADERS, (err, result) => {
                if (err)
                    return sendResponse(new ScanResult({acdcStatus: ACDC_STATUS.DOWN, err: err}));
                result = typeof result === 'string' ? JSON.parse(result) : result;
                return sendResponse(new ScanResult({...result, acdcStatus: ACDC_STATUS.UP}));
            });
        });
    });
}


module.exports = startACDCMiddleware;