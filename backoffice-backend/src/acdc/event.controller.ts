import {Controller, Get, Param, Query, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags} from "@nestjs/swagger";
import {Event} from "./event.entity"
import {Connection} from "typeorm";
import {EventRepository} from "./event.repository";
import {AuthGuard} from "@nestjs/passport";
import {EventSearchQuery, EventSearchValidator} from "./eventsearch.validator";

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
    @ApiOperation({summary: "Search for events based on filters apply"})
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
    @ApiQuery({required: false, type: String, isArray: true, name: 'snCheckResult'})
    @ApiQuery({required: false, type: String, isArray: true, name: 'snCheckLocation'})
    @ApiQuery({required: false, type: Date, isArray: false, example: '2021-12-31', name: 'expiryDateEnd'})
    @ApiQuery({required: false, type: Date, isArray: false, example: '2021-01-01', name: 'expiryDateStart'})
    @ApiQuery({required: false, type: String, isArray: true, name: 'productName'})
    @ApiQuery({required: false, type: String, isArray: true, name: 'serialNumber'})
    @ApiQuery({required: false, type: String, isArray: true, name: 'batch'})
    @ApiQuery({required: false, type: String, isArray: true, name: 'productCode'})
    @ApiQuery({required: false, type: Date, isArray: false, example: '2021-12-31', name: 'createdOnEnd'})
    @ApiQuery({required: false, type: Date, isArray: false, example: '2021-01-01', name: 'createdOnStart'})
    @ApiQuery({required: false, type: String, isArray: true, name: 'eventId'})
    @ApiQuery({required: false, type: Number, isArray: false, name: 'limit'})
    @ApiQuery({required: false, type: Number, isArray: false, name: 'page'})
    async search(@Query(EventSearchValidator) eventSearchQuery: EventSearchQuery): Promise<object> {
        console.log("event.controller.search... query=", eventSearchQuery);
        const {eventCollection, count, query} = await this.eventRepository.search(eventSearchQuery);
        console.log("event.Search events[0] =", eventCollection[0]);
        return {
            meta: {
                itemsCount: count,
                itemsPerPage: eventSearchQuery.limit,
                currentPage: eventSearchQuery.page,
                totalPages: Math.ceil(count / eventSearchQuery.limit),
            },
            query,
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