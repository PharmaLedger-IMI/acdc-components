const APPLICATION_IDENTIFIERS = {
    "01": {
        type: "gtin",
        fixedLength: 14
    },
    "10": {
        type: "batchNumber",
        fixedLength: false,
        maxLength: 20
    },
    "11": {
        type: "productionDate",
        fixedLength: 6
    },
    "15": {
        type: "bestBeforeDate",
        fixedLength: 6
    },
    "17": {
        type: "expirationDate",
        fixedLength: 6
    },
    "21": {
        type: "serialNumber",
        fixedLength: false,
        maxLength: 20
    }
}

function parse(gs1String) {
    const components = {};

    function __parseRecursively(_gs1String) {
        if (_gs1String.length === 0) {
            return components;
        }
        const {ai, newGs1String} = extractFirstAI(_gs1String);
        return __parseRecursively(populateComponents(components, newGs1String, ai));
    }

    return __parseRecursively(gs1String);
}

function extractFirstAI(gs1String) {
    let ai;
    let newGs1String;
    if (gs1String.startsWith("(")) {
        const endIndex = gs1String.indexOf(')');
        ai = gs1String.substring(1, endIndex);
        newGs1String = gs1String.substring(endIndex + 1);
    } else {
        ai = gs1String.slice(0, 2);
        let i = 2;
        while (typeof APPLICATION_IDENTIFIERS[ai] === "undefined" && ai.length < 4) {
            ai += gs1String[i];
            i++;
        }

        newGs1String = gs1String.substring(i);
    }

    return {ai, newGs1String}
}

function populateComponents(components, gs1String, ai) {
    let aiObj = APPLICATION_IDENTIFIERS[ai];
    if (typeof aiObj === "undefined") {
        throw Error(`Invalid application identifier ${ai}. Have you registered it in the APPLICATION_IDENTIFIERS dictionary?`);
    }
    if (aiObj.fixedLength) {
        components[aiObj.type] = gs1String.substring(0, aiObj.fixedLength);
        return gs1String.substring(aiObj.fixedLength);
    } else {
        components[aiObj.type] = "";
        let len = Math.min(aiObj.maxLength, gs1String.length);
        for (let i = 0; i < len; i++) {
            if (gs1String[i] === '(') {
                return gs1String.substring(i);
            }
            components[aiObj.type] += gs1String[i];
        }

        return gs1String.substring(len);
    }
}

const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

/**
 * converts date from ISO (YYYY-MM-DD) to YYYY-HM, where HM comes from human name for the month, i.e. 2021-DECEMBER
 * @param {string} dateString
 */
function convertFromISOtoYYYY_HM(dateString) {
    const splitDate = dateString.split('-');
    const month = parseInt(splitDate[1]);
    return `${splitDate[2]} - ${monthNames[month - 1].slice(0, 3)} - ${splitDate[0]}`;
}

function convertFromGS1DateToYYYY_HM(gs1DateString) {
    let year = "20" + gs1DateString.slice(0, 2);
    let month = gs1DateString.slice(2, 4);
    let day = gs1DateString.slice(4);
    return `${day} - ${monthNames[month - 1].slice(0, 3)} - ${year}`
}

function getFetchUrl(relativePath) {
    if (window["$$"] && $$.SSAPP_CONTEXT && $$.SSAPP_CONTEXT.BASE_URL && $$.SSAPP_CONTEXT.SEED) {
        // if we have a BASE_URL then we prefix the fetch url with BASE_URL
        return `${new URL($$.SSAPP_CONTEXT.BASE_URL).pathname}${
            relativePath.indexOf("/") === 0 ? relativePath.substring(1) : relativePath
        }`;
    }
    return relativePath;
}

function getMountPath(gtinSSI, gs1Fields) {
    if (typeof gtinSSI !== "string") {
        gtinSSI = gtinSSI.getIdentifier();
    }
    return `/packages/${gtinSSI}${gs1Fields.serialNumber}|${gs1Fields.expiry}`;
}

function refreshProductDSU(dsuDataRetrievalService, storage, callback) {
    dsuDataRetrievalService.getPathToProductDSU((err, pathToProductDSU) => {
        if (err) {
            return callback(err);
        }
        storage.call("refreshDSUMountedAtPath", pathToProductDSU, (err) => {
            if (err) {
                return callback(err);
            }

            callback(undefined, true);
        });
    });
}

function refreshBatchDSU(storage, basePath, callback) {
    storage.call("refreshDSUMountedAtPath", `${basePath}/batch`, (err) => {
        if (err) {
            return callback(err);
        }

        callback(undefined, true);
    });
}

function refreshMountedDSUs(dsuDataRetrievalService, storage, basePath, callback){
    refreshBatchDSU(storage, basePath, (err)=>{
        if (err) {
            return callback(err);
        }

        refreshProductDSU(dsuDataRetrievalService, storage, callback);
    });
}
export default {
    convertFromISOtoYYYY_HM,
    convertFromGS1DateToYYYY_HM,
    getFetchUrl,
    getMountPath,
    refreshProductDSU,
    refreshBatchDSU,
    refreshMountedDSUs
};
