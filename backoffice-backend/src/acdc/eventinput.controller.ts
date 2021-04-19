import {Connection} from "typeorm";
import {Body, Controller, Delete, Get, Param, Post, Put} from "@nestjs/common";
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {EventInput} from "./eventinput.entity"

@ApiTags("EventInput")
@Controller("/acdc/eventinput")
export class EventInputController {
    constructor(private connection: Connection) {
    }

    @Get()
    @ApiOperation({summary: "Get all EventInputs"})
    async findAll(): Promise<EventInput[]> {
        let eventInputCollection = await EventInput.find({order: {eventinputid: "ASC"}});
        console.log("eventInput.findAll, eventInputCollection =", eventInputCollection);
        return eventInputCollection;
    }

    @Put(":id")
    @ApiOperation({summary: "Update one EventInput"})
    async update(@Param("id") id: string, @Body() eventInputProperty: EventInput): Promise<EventInput> {
        console.log("eventInput.update... id=", id, "eventInput=", eventInputProperty);
        const eventInputRepository = this.connection.getRepository(EventInput);
        await eventInputRepository.update(id, eventInputProperty);
        const eventInput = await eventInputRepository.findOne(id)
        console.log("eventInput.update, eventInput =", eventInput);
        return eventInput;
    }

    @Post()
    @ApiOperation({summary: "Create one EventInput"})
    async create(@Body() eventInput: EventInput): Promise<EventInput> {
        console.log("eventInput.create... eventInput=", eventInput);
        const eventInputRepository = this.connection.getRepository(EventInput);
        await eventInputRepository.save(eventInput);
        console.log("eventInput.create, eventInput =", eventInput);
        return eventInput;
    }

    @Get(":id")
    @ApiOperation({summary: "Get one EventInput"})
    async findOne(@Param("id") id: string): Promise<EventInput> {
        console.log("eventInput.findOne... id=", id);
        let eventInput = await EventInput.findOne(id);
        console.log("eventInput.findOne eventInput =", eventInput);
        return eventInput;
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete one EventInput"})
    async remove(@Param("id") id: string): Promise<void> {
        console.log("eventInput.delete... id=", id);
        const eventInputRepository = this.connection.getRepository(EventInput);
        await eventInputRepository.delete(id);
        return;
    }
}
