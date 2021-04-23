import {Connection} from "typeorm";
import {Body, Controller, Delete, Get, Param, Post, Put, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {Event} from "./event.entity"
import {AuthGuard} from "@nestjs/passport";

@ApiTags("Event")
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller("/acdc/event")
export class EventController {
    constructor(private connection: Connection) {
    }

    @Get()
    @ApiOperation({summary: "Get all Events"})
    async findAll(): Promise<Event[]> {
        let eventCollection = await Event.find({order: {eventid: "ASC"}});
        console.log("event.findAll, eventCollection =", eventCollection);
        return eventCollection;
    }

    @Put(":id")
    @ApiOperation({summary: "Update one Event"})
    async update(@Param("id") id: string, @Body() eventProperty: Event): Promise<Event> {
        console.log("Event.update... id=", id, "event=", eventProperty);
        const eventRepository = this.connection.getRepository(Event);
        await eventRepository.update(id, eventProperty);
        const event = await eventRepository.findOne(id)
        console.log("event.update, event =", event);
        return event;
    }

    @Post()
    @ApiOperation({summary: "Create one Event"})
    async create(@Body() event: Event): Promise<Event> {
        console.log("event.create... event=", event);
        const eventRepository = this.connection.getRepository(Event);
        await eventRepository.save(event);
        console.log("event.create, event =", event);
        return event;
    }

    @Get(":id")
    @ApiOperation({summary: "Get one Event"})
    async findOne(@Param("id") id: string): Promise<Event> {
        console.log("event.findOne... id=", id);
        let event = await Event.findOne(id);
        console.log("event.findOne event =", event);
        return event;
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete one Event"})
    async remove(@Param("id") id: string): Promise<void> {
        console.log("event.delete... id=", id);
        const eventRepository = this.connection.getRepository(Event);
        await eventRepository.delete(id);
        return;
    }
}
