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
        description: "Query a list of events.",
        schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    eventId: {type: 'string'},
                    mahId: {type: 'string'},
                    createdOn: {type: "string", format: "date-time"},
                    eventData: {type: "object"},
                    eventInputs: {type: "object"},
                    eventOutputs: {type: "object"}
                }
            }

        },
    })
    async findAll() {
        const eventCollection = await this.eventRepository.findAll();
        console.log("event.findAll, eventCollection =", eventCollection);
        return eventCollection
    }

    @Get("search")
    @ApiOperation({summary: "Search Events"})
    @ApiOkResponse({
        description: "Query a list of events.",
        schema: {
            type: "object",
            properties: {
                metadata: {
                    type: "object",
                    properties: {
                        itemsCount: {type: "number"},
                        itemsPerPage: {type: "number"},
                        currentPage: {type: "number"},
                        totalPages: {type: "number"}
                    }
                },
                items: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            eventId: {type: 'string'},
                            mahId: {type: 'string'},
                            createdOn: {type: "string", format: "date-time"},
                            eventData: {type: "object"},
                            eventInputs: {type: "object"},
                            eventOutputs: {type: "object"}
                        }
                    }
                }
            }
        },
    })
    @ApiQuery({name: 'endDate', required: false, type: Date, description: "Start date from createdOn field"})
    @ApiQuery({name: 'startDate', required: false, type: Date, description: "End date from createdOn field"})
    @ApiQuery({name: 'page', required: true, type: Number, description: "Page number to be get"})
    @ApiQuery({name: 'limit', required: true, type: Number, description: "The number of items per page"})
    // TODO -> apply ValidationPipe to filter and set default values.
    async search(@Query() query, @Query('page', ParseIntPipe) page, @Query('limit', ParseIntPipe) limit): Promise<object> {
        query.page = page  <= 0 ? 0 : page
        query.limit = limit <= 0 ? 10 : limit
        query.skip = query.limit * query.page
        console.log("event.Search... query=", query);
        const {eventCollection, count} = await this.eventRepository.search(query);
        console.log("event.Search events =", eventCollection);
        return {
            meta: {
                itemsCount: count,
                itemsPerPage: query.limit,
                currentPage: query.page,
                totalPages: Math.ceil(count / query.limit),
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