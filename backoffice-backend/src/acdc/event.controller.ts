import {Controller, Get, Param, ParseIntPipe, Query, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags} from "@nestjs/swagger";
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
                eventId: {type: 'string'},
                mahId: {type: 'string'},
                createdOn: {type: "string", format: "date-time"},
                eventData: {type: "object"},
                eventInputs: {type: "object"},
                eventOutputs: {type: "object"}
            }
        },
    })
    @ApiQuery({name: 'limit', required: false, type: Number, isArray: false, description: "The number of items per page "})
    @ApiQuery({name: 'page' , required: false, type: Number, isArray: false, description: "Page number to be get"})
    async findAll(@Query('limit', ParseIntPipe) limit: number = 10, @Query('page', ParseIntPipe) page: number = 0) {
        page = page <= 0 ? 0 : page
        limit = limit <= 0 ? 1 : limit
        const skip = page * limit
        const {eventCollection, count} = await this.eventRepository.findAll(limit, skip);
        console.log("event.findAll, eventCollection =", eventCollection);
        return {
            meta: {
                itemsCount: count,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
            },
            items: eventCollection
        }
    }

    @Get(":id")
    @ApiOperation({summary: "Get one Event"})
    @ApiOkResponse({
        description: "Return a list of all events/scans processed.",
        schema: {
            type: "object",
            properties: {
                eventId: {type: 'string'},
                mahId: {type: 'string'},
                createdOn: {type: "string", format: "date-time"},
                eventData: {type: "object"},
                eventInputs: {type: "object"},
                eventOutputs: {type: "object"}
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
