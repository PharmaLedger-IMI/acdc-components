import {EntityRepository, Repository} from 'typeorm';
import {EventOutputDto} from "./eventoutput.dto";
import {EventOutput} from "./eventoutput.entity";

@EntityRepository(EventOutput)
export class EventOutputRepository extends Repository<EventOutput> {
    constructor() {
        super()
    }

    add = async (eventOutput: EventOutputDto) => {
        return await super.save(eventOutput)
    }

    findById = async (id: string) => {
        return await super.findOneOrFail(id)
    }

    findAll = async () => {
        return await super.find({order: {eventid: "ASC"}})
    }
}