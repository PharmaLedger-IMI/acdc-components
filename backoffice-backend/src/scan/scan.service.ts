import {BadRequestException, Injectable} from "@nestjs/common"
import {EventRepository} from "../acdc/event.repository"
import {EventInputDataDto} from "../acdc/eventinput.dto"
import {EventOuputDataDto} from "../acdc/eventoutput.dto"
import {EventInputRepository} from "../acdc/eventinput.repository"
import {EventOutputRepository} from "../acdc/eventoutput.repository"
import {InjectRepository} from "@nestjs/typeorm"
import {Event} from "src/acdc/event.entity"
import {Mah} from "src/acdc/mah.entity"
import {DummyCheckService} from "./dummycheck.service";


@Injectable()
export class ScanService {
    private dummyService: DummyCheckService;

    constructor(
        @InjectRepository(EventRepository) private eventRepository: EventRepository,
        @InjectRepository(EventInputRepository) private eventInputRepository: EventInputRepository,
        @InjectRepository(EventOutputRepository) private eventOutputRepository: EventOutputRepository
    ) {
        this.dummyService = new DummyCheckService();
    }

    async create(eventInputData: EventInputDataDto): Promise<EventOuputDataDto> {
        const eventOutputData = await this.dummyService.dummyCheckAuthentication(eventInputData)

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
}
