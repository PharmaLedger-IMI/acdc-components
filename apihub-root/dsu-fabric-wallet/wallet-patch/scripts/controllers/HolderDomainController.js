import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import constants from "./constants.js";

export default class HolderDomainController extends ContainerController {
    constructor(element, history) {
        super(element, history);

        this.setModel({});
        this.model.domain = "epi";

        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
        });

        let userDetails;
        this.DSUStorage.getObject("/user-details.json", (err, _userDetails) =>{
            userDetails = _userDetails;
            console.log("userDetails:", userDetails);
        });

        this.on("generate-identity", async (event) => {
            const opendsu = require("opendsu");
            const keyssiSpace = opendsu.loadApi("keyssi");
            const bdns = opendsu.loadApi("bdns");
            const bdnsDomain = await $$.promisify(bdns.getRawInfo)(this.model.domain)
            if (!bdnsDomain) {
                return this.showError(new Error(`${this.model.domain} is not a valid domain. Please check your settings`), "Unknown domain");
            }
            const seedSSI = keyssiSpace.createTemplateSeedSSI(this.model.domain);
            seedSSI.initialize(this.model.domain, (err)=>{
                if(err){
                    return this.showError(err, "Could not initialize the holder SSI");
                }
                this.DSUStorage.getObject(constants.ISSUER_FILE_PATH, (err, issuer) => {
                    this.DSUStorage.getObject(constants.WALLET_HOLDER_FILE_PATH, (err, holder) => {
                        if (err || typeof holder === "undefined") {
                            holder = {};
                        }
                        holder.domain = this.model.domain;
                        holder.subdomain = typeof issuer === "undefined" ? undefined : issuer.subdomain;
                        holder.ssi = seedSSI.getIdentifier();
                        holder.userDetails = userDetails;

                        this.DSUStorage.setObject(constants.WALLET_HOLDER_FILE_PATH, holder, (err) => {
                            if (err) {
                                return this.showError(err);
                            }
                            this.DSUStorage.setObject(constants.SSAPP_HOLDER_FILE_PATH, holder, (err) => {
                                if (err) {
                                    return this.showError(err);
                                }

                                this.History.navigateToPageByTag("holder");
                            });
                        })
                    })
                });
            });
        });
    }

    showError(err, title, type) {
        let errMessage;
        title = title ? title : 'Validation Error';
        type = type ? type : 'alert-danger';

        if (err instanceof Error) {
            errMessage = err.message;
        } else if (typeof err === 'object') {
            errMessage = err.toString();
        } else {
            errMessage = err;
        }
        this.feedbackEmitter(errMessage, title, type);
    }
}
