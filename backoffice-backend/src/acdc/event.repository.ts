import {EntityRepository, Repository} from 'typeorm';
import {Event} from './event.entity';
import {EventDto} from "./event.dto";

@EntityRepository(Event)
export class EventRepository extends Repository<Event> {
    constructor() {
        super()
    }

    add = async (eventDto: EventDto) => {
        return await super.save(eventDto)
    }

    findById = async (id: string) => {
        return await super.findOneOrFail(id, {relations: ["eventinput", "eventoutput"]})
    }

    findAll = async () => {
        return await super.find({order: {eventid: "ASC"}, relations: ["eventinput", "eventoutput"]})
    }
}