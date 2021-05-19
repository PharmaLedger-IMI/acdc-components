import ModalController from '../../cardinal/controllers/base-controllers/ModalController.js';

export default class LoadingController extends ModalController {

    constructor(element, history) {
        super(element, history);

        this.on('modal-button-click', (event) => {
            this._finishProcess(event, {})
        })
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}