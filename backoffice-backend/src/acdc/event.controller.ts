import {Controller, Get, Param, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags} from "@nestjs/swagger";
import {Event} from "./event.entity"
import {Connection} from "typeorm";
import {EventRepository} from "./event.repository";
import {AuthGuard} from "@nestjs/passport";

@ApiTags("Event")
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller("/acdc/event")
export class EventController {
    private eventRepository: EventRepository;

    constructor(private connection: Connection) {
        this.eventRepository = connection.getCustomRepository(EventRepository)
    }

    @Get()
    @ApiOperation({summary: "Get all Events"})
    @ApiOkResponse({
        description: "Return a list of all events/scans processed.",
        schema: {
            type: "object",
            properties: {
                eventid: {type: 'string'},
                mahid: {type: 'string'},
                createdon: {type: "string", format: "date-time"},
                eventdata: {type: "object"},
                eventinput: {type: "object"},
                eventoutput: {type: "object"}
            }
        },
    })
    async findAll(): Promise<Event[]> {
        const eventCollection = await this.eventRepository.findAll();
        console.log("event.findAll, eventCollection =", eventCollection);
        return eventCollection;
    }

    @Get(":id")
    @ApiOperation({summary: "Get one Event"})
    @ApiOkResponse({
        description: "Return a list of all events/scans processed.",
        schema: {
            type: "object",
            properties: {
                eventid: {type: 'string'},
                mahid: {type: 'string'},
                createdon: {type: "string", format: "date-time"},
                eventdata: {type: "object"},
                eventinput: {type: "object"},
                eventoutput: {type: "object"}
            }
        },
    })
    async findOne(@Param("id") id: string): Promise<Event> {
        console.log("event.findOne... id=", id);
        const event = await this.eventRepository.findById(id);
        console.log("event.findOne event =", event);
        return event;
    }
}
