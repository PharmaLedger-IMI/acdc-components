import utils from "../../../utils.js";

export default class DSUDataRetrievalService {
    constructor(storage, gtinSSI, basePath) {
        this.storage = storage;
        this.gtinSSI = gtinSSI;
        this.basePath = basePath;
        this.cache = {};
    }

    
    setBasePath(basePath){
        this.basePath = basePath;
        this.cache = {};
    }
    readBatchData(callback) {
        if (typeof this.cache.batchData !== "undefined") {
            return callback(undefined, this.cache.batchData);
        }
        this.storage.getObject(`${this.basePath}/batch/batch.json`, (err, batchData) => {
            if (err) {
                return callback(err);
            }
            if (typeof batchData === "undefined") {
                return callback(Error(`Batch data is undefined`));
            }
            this.cache.batchData = batchData;
            callback(undefined, batchData);
        });
    }

    getPathToProductDSU(callback) {
        if (typeof this.cache.pathToProductDSU !== "undefined") {
            return callback(undefined, this.cache.pathToProductDSU);
        }
        this.readBatchData((err, batchData) => {
            if (err) {
                this.cache.pathToProductDSU = `${this.basePath}/product/product/`
            } else {
                this.cache.pathToProductDSU = `${this.basePath}/batch/gtinDSU/product/`;
            }

            callback(undefined, this.cache.pathToProductDSU);
        });
    }

    getPathToProductVersion(callback) {
        if (typeof this.cache.pathToProductVersion !== "undefined") {
            return callback(undefined, this.cache.pathToProductVersion);
        }
        this.getPathToProductDSU((err, pathToProductDSU) => {
            if (err) {
                return callback(err);
            }
            this.cache.pathToProductDSU = pathToProductDSU;
            this.getProductVersion((err, version) => {
                if (err) {
                    return callback(err);
                }

                this.cache.pathToProductVersion = `${pathToProductDSU}${version}/`;
                callback(undefined, this.cache.pathToProductVersion);
            })
        })
    }

    readProductData(callback) {
        if (typeof this.cache.productData !== "undefined") {
            return callback(undefined, this.cache.productData);
        }
        this.getPathToProductVersion((err, pathToProductVersion) => {
            if (err) {
                return callback(err);
            }
            this.cache.pathToProductVersion = pathToProductVersion;
            this.storage.getObject(`${pathToProductVersion}product.json`, (err, productData) => {
                if (err) {
                    return callback(err);
                }

                if (typeof productData === "undefined") {
                    return callback(Error(`Product data is undefined.`))
                }

                productData.photo = utils.getFetchUrl(`/download${pathToProductVersion}/image.png`);
                this.cache.productData = productData;
                callback(undefined, productData);
            });
        })
    }

    getLatestProductVersion(pathToProductDSU, callback) {
        if (typeof this.cache.latestProductVersion !== "undefined") {
            return callback(undefined, this.cache.latestProductVersion);
        }
        this.storage.call("listFolders", pathToProductDSU, (err, versions) => {
            if (err) {
                return callback(err);
            }

            versions.sort((v1, v2) => {
                v1 = parseInt(v1);
                v2 = parseInt(v2);
                if (v1 < v2) {
                    return -1;
                }

                if (v1 === v2) {
                    return 0;
                }

                if (v1 > v2) {
                    return 1;
                }
            });
            this.cache.latestProductVersion = versions[versions.length - 1];
            callback(undefined, this.cache.latestProductVersion);
        });
    }

    getProductVersion(callback) {
        if (typeof this.cache.productVersion !== "undefined") {
            return callback(undefined, this.cache.productVersion);
        }
        this.readBatchData((err, batchData) => {
            if (err || typeof batchData === "undefined" || batchData.version === 'latest') {
                return this.getPathToProductDSU((err, pathToProductDSU) => {
                    if (err) {
                        return callback(err);
                    }
                    this.cache.pathToProductDSU = pathToProductDSU;
                    this.getLatestProductVersion(pathToProductDSU, (err, latestProductVersion) => {
                        if (err) {
                            return callback(err);
                        }

                        this.cache.latestProductVersion = latestProductVersion;
                        callback(undefined, latestProductVersion);
                    });
                });
            }
            this.cache.productVersion = batchData.version;
            callback(undefined, batchData.version);
        });
    }
}
