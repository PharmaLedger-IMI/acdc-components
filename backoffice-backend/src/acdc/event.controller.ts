import {Controller, Get, Param, Query, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags} from "@nestjs/swagger";
import {Event} from "./event.entity"
import {Connection} from "typeorm";
import {EventRepository} from "./event.repository";
import {AuthGuard} from "@nestjs/passport";
import {EventQuery, EventQueryValidator} from "./eventsearch.validator";
import {PaginatedDto} from "../paginated.dto";

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
                    eventInputs: {
                        type: "array", items: {
                            type: "object",
                            properties: {
                                eventInputId: {type: "string"},
                                eventId: {type: "string"},
                                eventInputData: {type: "object"}
                            }
                        }
                    },
                    eventOutputs: {
                        type: "array", items: {
                            type: "object",
                            properties: {
                                eventOutputId: {type: "string"},
                                eventId: {type: "string"},
                                eventOutputData: {type: "object"}
                            }
                        }
                    },
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
    @ApiOperation({summary: "Search for events based on a query"})
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
                query: {
                    type: "object",
                    properties: {
                        page: {type: "number"},
                        limit: {type: "number"},
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
                            eventInputs: {
                                type: "array", items: {
                                    type: "object",
                                    properties: {
                                        eventInputId: {type: "string"},
                                        eventId: {type: "string"},
                                        eventInputData: {type: "object"}
                                    }
                                }
                            },
                            eventOutputs: {
                                type: "array", items: {
                                    type: "object",
                                    properties: {
                                        eventOutputId: {type: "string"},
                                        eventId: {type: "string"},
                                        eventOutputData: {type: "object"}
                                    }
                                }
                            },
                        }
                    }
                }
            }
        },
    })
    async search(@Query(EventQueryValidator) eventQuery: EventQuery): Promise<PaginatedDto<EventQuery, Event>> {
        console.log("event.controller.search... query=", eventQuery);
        const page = await this.eventRepository.search(eventQuery);
        console.log("event.Search events[0] =", page[0]);
        return page
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
                eventInputs: {
                    type: "array", items: {
                        type: "object",
                        properties: {
                            eventInputId: {type: "string"},
                            eventId: {type: "string"},
                            eventInputData: {type: "object"}
                        }
                    }
                },
                eventOutputs: {
                    type: "array", items: {
                        type: "object",
                        properties: {
                            eventOutputId: {type: "string"},
                            eventId: {type: "string"},
                            eventOutputData: {type: "object"}
                        }
                    }
                },
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
