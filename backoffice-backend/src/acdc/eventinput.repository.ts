import {EntityRepository, Repository} from 'typeorm';
import {EventInput} from "./eventinput.entity";
import {EventInputDto} from "./eventinput.dto";

@EntityRepository(EventInput)
export class EventInputRepository extends Repository<EventInput> {
    constructor() {
        super()
    }

    add = async (eventInput: EventInputDto) => {
        return await super.save(eventInput)
    }

    findById = async (id: string) => {
        return await super.findOneOrFail(id)
    }

    findAll = async () => {
        return await super.find({order: {eventId: "ASC"}})
    }
}