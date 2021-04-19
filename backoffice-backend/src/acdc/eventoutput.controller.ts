import {Connection} from "typeorm";
import {Body, Controller, Delete, Get, Param, Post, Put} from "@nestjs/common";
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {EventOutput} from "./eventoutput.entity"

@ApiTags("EventOutput")
@Controller("/acdc/eventoutput")
export class EventOutputController {
    constructor(private connection: Connection) {
    }

    @Get()
    @ApiOperation({summary: "Get all EventOutputs"})
    async findAll(): Promise<EventOutput[]> {
        let eventOutputCollection = await EventOutput.find({order: {eventoutputid: "ASC"}});
        console.log("eventOutput.findAll, eventOutputCollection =", eventOutputCollection);
        return eventOutputCollection;
    }

    @Put(":id")
    @ApiOperation({summary: "Update one EventOutput"})
    async update(@Param("id") id: string, @Body() eventOutputProperty: EventOutput): Promise<EventOutput> {
        console.log("eventOutput.update... id=", id, "eventOutput=", eventOutputProperty);
        const eventRepository = this.connection.getRepository(EventOutput);
        await eventRepository.update(id, eventOutputProperty);
        const eventOutput = await eventRepository.findOne(id)
        console.log("eventOutput.update, eventOutput =", eventOutput);
        return eventOutput;
    }

    @Post()
    @ApiOperation({summary: "Create one EventOutput"})
    async create(@Body() eventOutput: EventOutput): Promise<EventOutput> {
        console.log("eventOutput.create... eventOutput=", eventOutput);
        const eventOutputRepository = this.connection.getRepository(EventOutput);
        await eventOutputRepository.save(eventOutput);
        console.log("eventOutput.create, eventOutput =", eventOutput);
        return eventOutput;
    }

    @Get(":id")
    @ApiOperation({summary: "Get one EventOutput"})
    async findOne(@Param("id") id: string): Promise<EventOutput> {
        console.log("eventOutput.findOne... id=", id);
        let eventOutput = await EventOutput.findOne(id);
        console.log("eventOutput.findOne eventOutput =", eventOutput);
        return eventOutput;
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete one EventOutput"})
    async remove(@Param("id") id: string): Promise<void> {
        console.log("eventOutput.delete... id=", id);
        const eventOutputRepository = this.connection.getRepository(EventOutput);
        await eventOutputRepository.delete(id);
        return;
    }
}
