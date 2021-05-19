import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

class FileDownloader {
    constructor(path, fileName) {
        this.path = path;
        this.fileName = fileName;

        if (this.path === '/') {
            this.path = '';
        }
    }

    downloadFile(callback) {
        if (!callback || typeof callback !== 'function') {
            callback = this.downloadFileToDevice;
        }

        this._getFileBlob(this.path, this.fileName, callback);
    }

    /**
     * @param {Object{ contentType: string, rawBlob: Blob }
     */
    downloadFileToDevice = (downloadedFile) => {
        window.URL = window.URL || window.webkitURL;
        let blob = downloadedFile.rawBlob;

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            const file = new File([blob], this.fileName);
            window.navigator.msSaveOrOpenBlob(file);
            return;
        }

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = this.fileName;
        link.click();
    };

    _getFileBlob(path, fileName, callback) {
        let url = `/download${path}/${fileName}`;
        fetch(url)
            .then((response) => {
                if (response.ok) {
                    response.blob().then((blob) => {
                        callback({
                            contentType: response.headers.get('Content-Type') || '',
                            rawBlob: blob
                        });
                    });
                } else {
                    console.error(`Error on download file ${path}/${fileName}: `, response);
                }
            });
    }
}

const TEXT_MIME_TYPE = "text/";

export default class displayLeafletPDF extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.setModel({});
        this.fileName = "leaflet.pdf";
        this.path = "/tmp/batch/product";
        this.fileDownloader = new FileDownloader(this.path, this.fileName);

        this._downloadFile();
    }

    _downloadFile = () => {
        this.fileDownloader.downloadFile((downloadedFile) => {
            this.rawBlob = downloadedFile.rawBlob;
            this.mimeType = downloadedFile.contentType;
            this.blob = new Blob([this.rawBlob], {
                type: this.mimeType
            });

            if (this.mimeType.indexOf(TEXT_MIME_TYPE) !== -1) {
                this._prepareTextEditorViewModel();
            } else {
                this._displayFile();
            }
        });
    };

    _prepareTextEditorViewModel = () => {
        const clearInnerHTML = () => {
            const conditionElm = this.element.querySelector(".content psk-condition");
            if (conditionElm && conditionElm.parentElement) {
                conditionElm.parentElement.removeChild(conditionElm);
            }
        };

        const attachInnerHTML = () => {
            clearInnerHTML();

            const conditionElm = document.createElement("psk-condition");
            conditionElm.condition = "@isEditing";

            const liveCodeElm = document.createElement("psk-live-code");
            liveCodeElm.slot = "condition-true";
            liveCodeElm.setAttribute('view-model', 'textEditor');

            const codeElm = document.createElement("psk-code");
            codeElm.slot = "condition-false";
            codeElm.language = "@textEditor.language";
            codeElm.innerHTML = this.model.textEditor.value;

            conditionElm.appendChild(liveCodeElm);
            conditionElm.appendChild(codeElm);
            this._appendAsset(conditionElm);
        };

        const reader = new FileReader();
        reader.onload = () => {
            const textEditorViewModel = {
                isEditable: true,
                value: reader.result,
                oldValue: reader.result,
                language: this.mimeType.split(TEXT_MIME_TYPE)[1]
            };

            this.model.setChainValue("textEditor", textEditorViewModel);
            attachInnerHTML();
        };
        reader.readAsText(this.blob);
    };

    _displayFile = () => {
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            const file = new File([this.rawBlob], this.fileName);
            window.navigator.msSaveOrOpenBlob(file);
            return;
        }

        window.URL = window.URL || window.webkitURL;
        const fileType = this.mimeType.split("/")[0];
        switch (fileType) {
            case "image": {
                this._loadImageFile();
                break;
            }
            case "audio":
            case "video": {
                this._loadAudioVideoFile(fileType);
                break;
            }
            default: {
                this._loadOtherFile();
                break;
            }
        }
    };

    _loadBlob = (callback) => {
        const reader = new FileReader();
        reader.readAsDataURL(this.blob);
        reader.onloadend = function () {
            callback(reader.result);
        }
    };

    _loadImageFile = () => {
        this._loadBlob((base64Blob) => {
            const img = document.createElement("img");
            img.src = base64Blob;
            img.alt = this.path;

            this._appendAsset(img);
        });
    };

    _loadAudioVideoFile = (fileType) => {
        this._loadBlob((base64Blob) => {
            const elm = document.createElement(fileType),
                source = document.createElement("source");
            source.type = this.mimeType;
            source.src = base64Blob;
            elm.append(source);
            elm.controls = "true";

            this._appendAsset(elm);
        });
    };

    _loadOtherFile = () => {
        this._loadBlob((base64Blob) => {
            const obj = document.createElement("object");
            obj.width = "100%";
            obj.height = "100%";
            obj.type = this.mimeType;
            obj.data = base64Blob;

            this._appendAsset(obj);
        });
    };

    _appendAsset = (assetObject) => {
        let assetContainer = this.element.querySelector(".content");
        if (assetContainer) {
            assetContainer.append(assetObject);
        }
    }
}