import {Injectable} from "@nestjs/common"
import {EventRepository} from "../acdc/event.repository"
import {EventInputDataDto} from "../acdc/eventinput.dto"
import {EventOuputDataDto} from "../acdc/eventoutput.dto"
import {EventInputRepository} from "../acdc/eventinput.repository"
import {EventOutputRepository} from "../acdc/eventoutput.repository"
import {InjectRepository} from "@nestjs/typeorm"
import { Mah } from "src/acdc/mah.entity"


@Injectable()
export class ScanService {

    constructor(
        @InjectRepository(EventRepository) private eventRepository: EventRepository,
        @InjectRepository(EventInputRepository) private eventInputRepository: EventInputRepository,
        @InjectRepository(EventOutputRepository) private eventOutputRepository: EventOutputRepository
    ) {
    }

    async create(eventInputData: EventInputDataDto): Promise<EventOuputDataDto> {
        const eventOutputData = await ScanService.dummyCheckAuthentication(eventInputData.productCode);

        const eventInput = await this.eventInputRepository.add({
            eventInputData: eventInputData
        })

        const eventOutput = await this.eventOutputRepository.add({
            eventOutputData: eventOutputData
        })

        await this.eventRepository.add({
            mahId: eventOutputData.mahId,
            createdOn: new Date(),
            eventData: {},
            eventInputs: [eventInput],
            eventOutputs: [eventOutput]
        })

        return eventOutputData
    }

    private static randomChoice(arr: string[]): string {
        const randomIdx = (Math.random() * arr.length) | 0
        return arr[randomIdx]
    }

    private static async dummyCheckAuthentication(productCode: string): Promise<EventOuputDataDto> {
        let response = new EventOuputDataDto();
        response.snCheckResult = ScanService.randomChoice(["Authentic", "Suspect", "TimeOut", "UserAbort", "Unsure"]);
        response.nameMedicinalProduct = ScanService.randomChoice(["Cosentyx 150mg/ml x2", "Ritalin LA HGC 40mg 1x30", "Aspirin 500mg 1x25", "Keytruda 25mg/ml"]);
        let mahCollection = await Mah.find({});
        if (mahCollection.length > 0) {
            let mah = mahCollection[0];
            response.mahId = mah.mahId;
            response.mahName = mah.name;
        }
        return response;
    }
}