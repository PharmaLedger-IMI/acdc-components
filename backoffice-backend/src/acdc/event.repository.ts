import {createQueryBuilder, EntityRepository, Repository} from 'typeorm';
import {Event} from './event.entity';
import {EventDto} from "./event.dto";
import {EventSearchQuery} from "./eventsearch.validator";

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

    /**
     * Performs a SQL query applying the filters according to the @param
     * @param eventSearchQuery
     */
    async search(eventSearchQuery: EventSearchQuery): Promise<{ count: number; query: EventSearchQuery; eventCollection: any; }> {
        console.log('event.repository.search query=', eventSearchQuery)

        const transformValueToCommaList = (arr: string[] | string): string => {
            arr = Array.isArray(arr) ? arr : [arr]
            return arr.map(value => `'${value}'`).join(',');
        }

        const getJsonWhereStatement = (fieldName: string, jsonProperty: string, values: string[] | string): string => {
            values = Array.isArray(values) ? values : [values]
            let str = ''
            values.forEach((value: string, index: number) => {
                if (index == 0) {
                    str += `${fieldName} ::jsonb @> \'{"${jsonProperty}":"${value}"}\'`
                } else {
                    str += `OR ${fieldName} ::jsonb @> \'{"${jsonProperty}":"${value}"}\'`
                }
            })
            return str
        }

        // TODO -> add filter by expiryDate & ? option: OR or AND in where ?
        /** NOTE: The name of "whereFunctions" need to be the same name of filter/properties of EventSearchQuery */
        const whereFunctions = {
            eventId(eventIds: string[] | string): string {
                return `event.eventid IN (${transformValueToCommaList(eventIds)})`
            },
            createdOnStart(date: string): string {
                return `event.createdOn >= '${date}'`
            },
            createdOnEnd(date: string): string {
                return `event.createdOn <= '${date}'`
            },
            productCode(productsCode: string[] | string): string {
                return getJsonWhereStatement('eventinput.eventinputdata', 'productCode', productsCode)
            },
            batch(batches: string[]  | string): string {
                return getJsonWhereStatement('eventinput.eventinputdata', 'batch', batches)
            },
            serialNumber(serialNumbers: string[] | string): string {
                return getJsonWhereStatement('eventinput.eventinputdata', 'serialNumber', serialNumbers)
            },
            nameMedicinalProduct(nameMedicinalProducts: string[]  | string): string {
                return getJsonWhereStatement('eventoutput.eventoutputdata', 'nameMedicinalProduct', nameMedicinalProducts)
            },
            productStatus(productsStatus: string[] | string): string {
                return getJsonWhereStatement('eventoutput.eventoutputdata', 'productStatus', productsStatus)
            },
            // expiryDateStart(date: string): string {
            //     return `eventinput.eventinputdata ->> 'expiryDate' >= '${date}'`
            // },
            // expiryDateEnd(date: string): string {
            //     return `eventinput.eventinputdata ->> 'expiryDate' <= '${date}'`
            // },
            snCheckLocation(snCheckLocations: string[] | string): string {
                return getJsonWhereStatement('eventinput.eventinputdata', 'snCheckLocation', snCheckLocations)
            },
            snCheckResult(snCheckResults: string[] | string): string {
                return getJsonWhereStatement('eventoutput.eventoutputdata', 'snCheckResult', snCheckResults)
            },
        }

        const queryBuilder = await createQueryBuilder(Event, 'event')
            .innerJoinAndSelect('event.eventInputs', 'eventinput')
            .innerJoinAndSelect('event.eventOutputs', 'eventoutput')

        for (let [filterName, filterValue] of Object.entries(eventSearchQuery)) {
            const whereFilter = whereFunctions[filterName]
            if (!!whereFilter) {
                queryBuilder.andWhere(whereFilter(filterValue))
            }
        }

        const count = await queryBuilder.getCount()
        queryBuilder.take(eventSearchQuery.limit)
        queryBuilder.skip(eventSearchQuery.page * eventSearchQuery.limit)

        const eventCollection = await queryBuilder.getMany()

        return {count, eventCollection, query: eventSearchQuery}
    }
}