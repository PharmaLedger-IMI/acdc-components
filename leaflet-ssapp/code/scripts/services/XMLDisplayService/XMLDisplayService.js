import LanguageService from "../LanguageService/LanguageService.js";
import DSUDataRetrievalService from "../DSUDataRetrievalService/DSUDataRetrievalService.js";
import constants from "../../../constants.js";

const pathToXsl = constants.XSL_PATH;
let errorMessage = "This is a valid product. However, more information about this product has not been published by the Pharmaceutical Company. Please check back later.";

export default class XmlDisplayService {
    constructor(dsuStorage, element, gtinSSI, basePath, xmlType, xmlFile, model) {
        this.languageService = new LanguageService(dsuStorage);
        this.DSUStorage = dsuStorage;
        this.element = element;
        this.gtinSSI = gtinSSI;
        this.xmlType = xmlType;
        this.xmlFile = xmlFile;
        this.model = model;
        this.dsuDataRetrievalService = new DSUDataRetrievalService(dsuStorage, gtinSSI, basePath);
    }

    displayXml(language) {
        if (typeof language !== "undefined") {
            return this.displayXmlForLanguage(language);
        }

        this.languageService.getWorkingLanguages((err, workingLanguages) => {
            const searchForLeaflet = (languages) => {
                if(languages.length === 0) {
                    this.displayError();
                    return;
                }
                const languageCode = languages.shift().value;
                this.readXmlFile(languageCode, (err, xmlContent, pathBase) => {
                    if (err) {
                        searchForLeaflet(languages);
                    } else {
                        return this.applyStylesheetAndDisplayXml(pathBase, xmlContent);
                    }
                });
            }
            searchForLeaflet(workingLanguages);
        })
    }

    isXmlAvailable() {
        this.getAvailableLanguagesForXmlType((err, languages) => {
            this.model.isSmpc = languages.length > 0;
            this.model.leafletColumns = languages.length > 0 ? 2 : 1;
        });
    }

    populateModel() {
        this.getAvailableLanguagesForXmlType((err, languages) => {
            this.languageService.addWorkingLanguages(languages, (err) => {
                if (languages.length >= 2) {
                    this.languageService.getLanguagesForSelect(languages, (err, languagesForSelect) => {
                        if (err) {
                            return callback(err);
                        }
                        this.createLanguageSelector(languagesForSelect);
                        this.model.onChange("languages.value", () => {
                            this.displayXmlForLanguage(this.model.languages.value);
                        })
                    });
                }
                this.displayXml();
            });
        })
    }

    createLanguageSelector(languages) {
        this.model.twoOrMoreLanguages = true;
        this.model.languages = {
            value: languages[0].value,
            options: languages
        }
    }

    displayXmlForLanguage(language) {
        this.readXmlFile(language, (err, xmlContent, pathBase) => {
            if (err) {
                this.displayError();
                return;
            }

            this.applyStylesheetAndDisplayXml(pathBase, xmlContent);
        });
    }

    readXmlFile(language, callback) {
        this.buildBasePath((err, pathBase) => {
            const pathToLeafletLanguage = `${pathBase}${language}/`;
            const pathToXml = pathToLeafletLanguage + this.xmlFile;

            this.readFileAndDecodeContent(pathToXml, (err, xmlContent) => {
                if (err) {
                    return callback(err);
                }
                callback(undefined, xmlContent, pathToLeafletLanguage);
            })
        })
    }

    applyStylesheetAndDisplayXml(pathBase, xmlContent) {
        this.readFileAndDecodeContent(pathToXsl, (err, xslContent) => {
            if (err) {
                this.displayError();
                return;
            }
            this.displayXmlContent(pathBase, xmlContent, xslContent);
        });
    }

    displayError(){
        let errorMessageElement = this.getErrorMessageElement(errorMessage)
        this.element.querySelector("#content").appendChild(errorMessageElement);
    }

    displayXmlContent(pathBase, xmlContent, xslContent) {
        let xsltProcessor = new XSLTProcessor();
        xsltProcessor.setParameter(null, "resources_path", "download" + pathBase);
        let parser = new DOMParser();

        let xmlDoc = parser.parseFromString(xmlContent, "text/xml");
        let xslDoc = parser.parseFromString(xslContent, "text/xml");

        xsltProcessor.importStylesheet(xslDoc);

        let resultDocument = xsltProcessor.transformToFragment(xmlDoc, document);
        this.element.querySelector("#content").innerHTML = '';
        this.element.querySelector("#content").appendChild(resultDocument)
    }

    buildBasePath(callback) {
        this.dsuDataRetrievalService.getPathToProductVersion((err, pathToProductVersion) => {
            if (err) {
                return callback(err);
            }
            let pathBase = `${pathToProductVersion}${this.xmlType}/`;
            callback(undefined, pathBase);
        });
    }

    getErrorMessageElement(errorMessage) {
        let pskLabel = document.createElement("psk-label");
        pskLabel.className = "scan-error-message";
        pskLabel.label = errorMessage;
        return pskLabel;
    }

    readFileAndDecodeContent(path, callback) {
        this.DSUStorage.getItem(path, (err, content) => {
            if (err) {
                return callback(err);
            }
            let textDecoder = new TextDecoder("utf-8");
            callback(undefined, textDecoder.decode(content));
        })
    }

    getAvailableLanguagesForXmlType(callback) {
        this.buildBasePath((err, pathBase) => {
            this.DSUStorage.call("listFolders", pathBase, (err, languages) => {
                if (err) {
                    return callback(err);
                }

                callback(undefined, this.languageService.normalizeLanguages(languages));
            })
        });
    }

    registerLanguages(languages, callback) {
        this.languageService.addWorkingLanguages(languages, callback);
    }

    registerAvailableLanguages(callback) {
        this.getAvailableLanguagesForXmlType((err, languages) => {
            this.registerLanguages(languages, callback);
        });
    }
}
