import ContainerController from '../../cardinal/controllers/base-controllers/ContainerController.js';
import utils from "../../utils.js";
import XMLDisplayService from "../services/XMLDisplayService/XMLDisplayService.js";

export default class SMPCController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.setModel({});
        if (typeof history.location.state !== "undefined") {
            this.gtinSSI = history.location.state.gtinSSI;
            this.gs1Fields = history.location.state.gs1Fields;
        }

        this.on("go-back", (event)=> {
            history.push({
                pathname: `${new URL(history.win.basePath).pathname}drug-details`,
                state: {
                    gtinSSI: this.gtinSSI,
                    gs1Fields:this.gs1Fields
                }
            });
        })

        const xmlDisplayService = new XMLDisplayService(this.DSUStorage, element, this.gtinSSI, utils.getMountPath(this.gtinSSI, this.gs1Fields), "smpc", "smpc.xml", this.model);
        xmlDisplayService.populateModel();
    }
}