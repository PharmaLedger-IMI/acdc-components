import {Controller, Get, Param, Query, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath} from "@nestjs/swagger";
import {Event} from "./event.entity"
import {Connection} from "typeorm";
import {EventRepository} from "./event.repository";
import {AuthGuard} from "@nestjs/passport";
import {EventQuery, EventQueryValidator} from "./eventquery.validator";
import {PaginatedDto} from "../paginated.dto";
import { EventService } from "./event.service";

@ApiExtraModels(Event, PaginatedDto)
@ApiTags("Event")
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller("/acdc/event")
export class EventController {
    private eventRepository: EventRepository;

    constructor(private connection: Connection, private eventService: EventService) {
        this.eventRepository = connection.getCustomRepository(EventRepository)
    }

    @Get()
    @ApiOperation({summary: "Get all Events"})
    @ApiOkResponse({
        description: "Query a list of events.",
        schema: {
            type: "array",
            items: {$ref: getSchemaPath(Event)}
        }
    })
    async findAll(): Promise<Event[]> {
        const eventCollection = await this.eventRepository.findAll();
        console.log("event.findAll, eventCollection =", eventCollection);
        return eventCollection
    }

    @Get("search")
    @ApiOperation({summary: "Search for events based on a query"})
    @ApiOkResponse({
        schema: {
            allOf: [
                {$ref: getSchemaPath(PaginatedDto)},
                {
                    properties: {
                        results: {
                            type: 'array',
                            items: {$ref: getSchemaPath(Event)},
                        },
                    },
                },
            ],
        },
    })
    async search(@Query(EventQueryValidator) eventQuery: EventQuery): Promise<PaginatedDto<EventQuery, Event>> {
        console.log("event.controller.search... query=", eventQuery);
        const page = await this.eventRepository.search(eventQuery);
        console.log("event.controller.search events[0] =", page.results[0]);
        return page
    }

    @Get(":id")
    @ApiOperation({summary: "Get one Event"})
    @ApiOkResponse({
        type: Event
    })
    async findOne(@Param("id") id: string, @Query("fgt") fgt?: string): Promise<Event> {
        console.log("event.findOne... id=", id, "fgt=", fgt);
        const event = await this.eventService.getOne(id, !!fgt);
        console.log("event.findOne event =", event);
        return event;
    }
}
