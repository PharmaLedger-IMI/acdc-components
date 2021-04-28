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
        return await super.findOneOrFail(id, {relations: ["eventInputs", "eventOutputs"]})
    }

    findAll = async (take: number, skip: number): Promise<{count: number, eventCollection: Event[]}> => {
        const [eventCollection, count] = await super.findAndCount({
            order: {eventId: "ASC"},
            relations: ["eventInputs", "eventOutputs"],
            take: take,
            skip: skip
        })
        return {count, eventCollection}
    }
}