import {EventInputDataDto} from "../acdc/eventinput.dto";
import {EventOuputDataDto} from "../acdc/eventoutput.dto";
import {Mah} from "../acdc/mah.entity";

export class DummyCheckService {

    readonly serialNumber: { [key: string]: SerialNumber } = {
        valid: {
            snCheckResult: SnCheckResult.Authentic,
            productStatus: [ProductStatus.RMKT]
        },
        recalled: {
            snCheckResult: SnCheckResult.Authentic,
            productStatus: [ProductStatus.NREL]
        },
        decommissioned: {
            snCheckResult: SnCheckResult.Unsure,
            productStatus: [ProductStatus.RSTO]
        },
        wrong: {
            snCheckResult: SnCheckResult.Suspect,
            productStatus: [ProductStatus.RDES, ProductStatus.RSUS]
        }
    }

    /**
     * Key -> GTIN/NTIN or ProductCode
     */
    readonly products: { [key: string]: Product } = {
        '02113100000011': {
            nameMedicinalProduct: 'Cosentyx',
            batch: 'MAY1701',
            mahId: '0c1aec99-a17f-495d-adfc-008888baef6c',
            serialNumber: {
                '43023992515022': this.serialNumber.valid,
                '43023992515000': this.serialNumber.recalled,
                '43023992515099': this.serialNumber.decommissioned,
                'WRONG': this.serialNumber.wrong,
            },
        },
        '01133111111118': {
            nameMedicinalProduct: 'Keytruda',
            batch: 'MAY1702',
            mahId: '27e79e87-940a-475b-9d46-c266d3550d82',
            serialNumber: {
                '33023992515022': this.serialNumber.valid,
                '33023992515000': this.serialNumber.recalled,
                '33023992515099': this.serialNumber.decommissioned,
                'WRONG': this.serialNumber.wrong,
            },
        },
        '01183111111137': {
            nameMedicinalProduct: 'Fluarix',
            batch: 'MAY1703',
            mahId: 'e076cc6c-5bfd-4785-a06d-e79e057f80cf',
            serialNumber: {
                '33023992515022': this.serialNumber.valid,
                '33023992515000': this.serialNumber.recalled,
                '33023992515099': this.serialNumber.decommissioned,
                'WRONG': this.serialNumber.wrong,
            },
        },
    }

    /**
     * Choose a random element from a string array
     * @param arr
     * @return random array element
     */
    randomChoice = (arr: string[]): string => {
        const randomIdx = (Math.random() * arr.length) | 0
        return arr[randomIdx]
    }

    /**
     * Generate an ACDC scan response
     * @param eventInputData
     */
    async dummyCheckAuthentication(eventInputData: EventInputDataDto): Promise<EventOuputDataDto> {
        let response = new EventOuputDataDto();

        const product = this.products[eventInputData.productCode]
        if (product === undefined) {
            return response
        }

        let mah = await Mah.findOne(product.mahId);
        response.mahId = mah.mahId;
        response.mahName = mah.name;

        response.nameMedicinalProduct = product.nameMedicinalProduct
        const serialNumber = product.serialNumber[eventInputData.serialNumber]
        if (product.batch !== eventInputData.batch || serialNumber === undefined) {
            response.snCheckResult = SnCheckResult.Suspect
            return response
        }

        const snCheckResult = serialNumber.snCheckResult
        const productStatus = this.randomChoice(serialNumber.productStatus)
        response.snCheckResult = snCheckResult
        response.productStatus = productStatus

        return response;
    }
}

/**
 * ENUM CLASSES FROM TECH SPECIFICATION
 */
enum ProductStatus {
    RMKT = 'Released to market',
    NREL = 'Not released',
    NREG = 'Not registered',
    RSTO = 'Reported stolen',
    RDES = 'Reported destroyed',
    RSUS = 'Reported suspect',
}

enum SnCheckResult {
    Authentic = 'Authentic',
    Suspect = 'Suspect',
    TimeOut = 'TimeOut',
    UserAbort = 'UserAbort',
    Unsure = 'Unsure'
}

interface SerialNumber {
    snCheckResult: SnCheckResult,
    productStatus: ProductStatus[]
}

interface Product {
    nameMedicinalProduct: string;
    batch: string;
    mahId: string;
    serialNumber: { [key: string]: SerialNumber }
}
