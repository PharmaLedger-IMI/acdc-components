import {BadRequestException, Injectable} from "@nestjs/common"
import {EventRepository} from "../acdc/event.repository"
import {EventInputDataDto} from "../acdc/eventinput.dto"
import {EventOuputDataDto} from "../acdc/eventoutput.dto"
import {EventInputRepository} from "../acdc/eventinput.repository"
import {EventOutputRepository} from "../acdc/eventoutput.repository"
import {InjectRepository} from "@nestjs/typeorm"
import {Event} from "src/acdc/event.entity"
import {Mah} from "src/acdc/mah.entity"


@Injectable()
export class ScanService {

    constructor(
        @InjectRepository(EventRepository) private eventRepository: EventRepository,
        @InjectRepository(EventInputRepository) private eventInputRepository: EventInputRepository,
        @InjectRepository(EventOutputRepository) private eventOutputRepository: EventOutputRepository
    ) {
    }

    async create(eventInputData: EventInputDataDto): Promise<EventOuputDataDto> {
        const eventOutputData = await ScanService.dummyCheckAuthentication(eventInputData);

        const eventInput = await this.eventInputRepository.add({
            eventInputData: eventInputData
        })

        const eventOutput = await this.eventOutputRepository.add({
            eventOutputData: eventOutputData
        })

        const event = Event.create({
            mahId: eventOutputData.mahId,
            createdOn: new Date(),
            eventData: {},
            eventInputs: [eventInput],
            eventOutputs: [eventOutput]
        })
        await this.eventRepository.add(event)

        return eventOutputData
    }

    private static randomChoice(arr: string[]): string {
        const randomIdx = (Math.random() * arr.length) | 0
        return arr[randomIdx]
    }

    private static getMedicinalProductInfo(eventInputData: EventInputDataDto) {
        const productsCode = {
            '01201419000158': 'Cosentyx 150mg/ml x2',
            '29653329154760': 'Ritalin LA HGC 40mg 1x30',
            '30652009514715': 'Aspirin 500mg 1x25',
            '49408945163108': 'Keytruda 25mg/ml'
        }

        const productsStatus = {
            'RMKT': 'Released to market',
            'NREG': 'Not released',
            'NREL': 'Not registered', 'RSTO': 'Reported stolen',
            'RDES': 'Reported destroyed',
            'RSUS': 'Reported suspect',
        }
        const productStatusKey = eventInputData.batch.substr(0, 4)
        const nameMedicinalProduct = productsCode[eventInputData.productCode]
        const productStatus = productsStatus[productStatusKey]
        return {nameMedicinalProduct, productStatus}
    }

    private static async dummyCheckAuthentication(eventInputData: EventInputDataDto): Promise<EventOuputDataDto> {
        let response = new EventOuputDataDto();
        response.snCheckResult = ScanService.randomChoice(["Authentic", "Suspect", "TimeOut", "UserAbort", "Unsure"]);

        const {nameMedicinalProduct, productStatus} = ScanService.getMedicinalProductInfo(eventInputData)
        response.nameMedicinalProduct = nameMedicinalProduct
        response.productStatus = productStatus

        if(!nameMedicinalProduct || !productStatus) {
            throw new BadRequestException('productCode or Batch invalid');
        }

        let mahCollection = await Mah.find({});
        if (mahCollection.length > 0) {
            let mah = mahCollection[0];
            response.mahId = mah.mahId;
            response.mahName = mah.name;
        }
        return response;
    }
}
