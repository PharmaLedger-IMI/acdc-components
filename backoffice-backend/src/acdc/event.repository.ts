import {Between, EntityRepository, LessThanOrEqual, MoreThanOrEqual, Repository} from 'typeorm';
import {Event} from './event.entity';
import {EventDto} from "./event.dto";

@EntityRepository(Event)
export class EventRepository extends Repository<Event> {
    constructor() {
        super()
    }

    async add(eventDto: EventDto): Promise<Event> {
        return await super.save(eventDto)
    }

    async findById(id: string): Promise<Event> {
        return await super.findOneOrFail(id, {relations: ["eventInputs", "eventOutputs"]})
    }

    async findAll(): Promise<Event[]> {
        return await super.find({
            order: {eventId: "ASC"},
            relations: ["eventInputs", "eventOutputs"]
        })
    }

    // TODO -> Apply "QueryBuilder". Issues: relations, skip and limit (was not working well in tests/validation)
    async search(query: any): Promise<{count: number, eventCollection: Event[]}> {
        console.log("event.repository event.query=", query)

        const where = {}
        if (!!query.endDate && !!query.startDate) {
            where['createdOn'] = Between(query.startDate, query.endDate)
        } else if (!!query.endDate) {
            where['createdOn'] = LessThanOrEqual(query.endDate)
        } else if (!!query.startDate) {
            where['createdOn'] = MoreThanOrEqual(query.startDate)
        }

        const options = {
            where: where,
            take: query.limit,
            skip: query.skip,
            relations: ["eventInputs", "eventOutputs"],
        }

        const [eventCollection, count] = await super.findAndCount({
            ...options,
            order: {eventId: "ASC"},
        })
        return {count, eventCollection}
    }
}