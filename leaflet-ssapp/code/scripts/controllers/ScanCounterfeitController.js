import ContainerController from '../../cardinal/controllers/base-controllers/ContainerController.js';

export default class ScanErrorController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.setModel({
            ... history.location.state,
            title: 'Potential counterfeiting detected'
        });
    }
}