import {Injectable} from "@nestjs/common"
import {EventRepository} from "../acdc/event.repository"
import {EventInputDataDto} from "../acdc/eventinput.dto"
import {EventOuputDataDto, EventOutputDto} from "../acdc/eventoutput.dto"
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
        const eventOutputData = await ScanService.dummyCheckAuthentication(eventInputData.gtin);

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

    private static dummyVerification(): string {
        const authenticationResponse = ["Authentic", "Suspect", "TimeOut", "UserAbort", "Unsure"]
        const randomIdx = (Math.random() * authenticationResponse.length) | 0
        return authenticationResponse[randomIdx]
    }

    private static async dummyCheckAuthentication(gtin: string): Promise<EventOuputDataDto> {
        let response = new EventOuputDataDto();
        response.snCheckResult = ScanService.dummyVerification();
        let mahCollection = await Mah.find({});
        if (mahCollection.length > 0) {
            let mah = mahCollection[0];
            response.mahId = mah.mahId;
            response.mahName = mah.name;
        }
        return response;
    }
}