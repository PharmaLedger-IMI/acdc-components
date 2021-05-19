import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import utils from "../../utils.js";
import DSUDataRetrievalService from "../services/DSUDataRetrievalService/DSUDataRetrievalService.js";
import constants from "../../constants.js";

export default class ReportController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.setModel({});
        if (typeof history.location.state !== "undefined") {
            this.gtinSSI = history.location.state.gtinSSI;
            this.gs1Fields = history.location.state.gs1Fields;
            this.model.serialNumber = this.gs1Fields.serialNumber;
            this.model.gtin = this.gs1Fields.gtin;
            this.model.batchNumber = this.gs1Fields.batchNumber;
            this.model.expiryForDisplay = this.gs1Fields.expiry;
        }

        const basePath = utils.getMountPath(this.gtinSSI, this.gs1Fields);
        this.dsuDataRetrievalService = new DSUDataRetrievalService(this.DSUStorage, this.gtinSSI, basePath);
        this.dsuDataRetrievalService.readProductData((err, product) => {
            let iframe = document.createElement("iframe");
            iframe.src = `${product.reportURL}#x-blockchain-domain-request`;
            iframe.style = "height: 100%; width:100%";
            console.log(iframe);
            this.element.querySelector("#content").appendChild(iframe);
        });
    }
}
