import {createQueryBuilder, EntityRepository, Repository} from 'typeorm';
import {Event} from './event.entity';
import {EventQuery} from "./eventquery.validator";
import {Operators, QueryBuilderHelper} from "../utils/QueryBuilderHelper";
import {BadRequestException} from "@nestjs/common";
import {PaginatedDto} from "../paginated.dto";

@EntityRepository(Event)
export class EventRepository extends Repository<Event> {
    constructor() {
        super()
    }

    async add(eventDto: Event): Promise<Event> {
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
     * @param eventQuery
     */
    async search(eventQuery: EventQuery): Promise<PaginatedDto<EventQuery, Event>> {
        console.log('event.repository.search query=', eventQuery)

        const queryBuilderHelper = new QueryBuilderHelper()

        // TODO -> add filter by expiryDate & ? option: OR or AND in where ?
        /** NOTE: The name of "whereFunctions" need to be the same name of filter/properties of EventSearchQuery */
        const whereFunctions = {
            eventId(eventIds: string[] | string): string {
                return queryBuilderHelper.commonWhereStatement('event.eventid', Operators.IN, eventIds)
            },
            createdOnStart(date: string): string {
                return queryBuilderHelper.commonWhereStatement('event.createdOn::date', Operators.MTE, date)
            },
            createdOnEnd(date: string): string {
                return queryBuilderHelper.commonWhereStatement('event.createdOn::date', Operators.LTE, date)
            },
            productCode(productsCode: string[] | string): string {
                return queryBuilderHelper.jsonWhereOrStatement('eventinput.eventinputdata', 'productCode', Operators.ILIKE, productsCode)
            },
            batch(batches: string[] | string): string {
                return queryBuilderHelper.jsonWhereOrStatement('eventinput.eventinputdata', 'batch', Operators.ILIKE, batches)
            },
            serialNumber(serialNumbers: string[] | string): string {
                return queryBuilderHelper.jsonWhereOrStatement('eventinput.eventinputdata', 'serialNumber', Operators.ILIKE, serialNumbers)
            },
            nameMedicinalProduct(nameMedicinalProducts: string[] | string): string {
                return queryBuilderHelper.jsonWhereOrStatement(
                    'eventoutput.eventoutputdata',
                    'nameMedicinalProduct',
                    Operators.ILIKE,
                    nameMedicinalProducts
                )
            },
            productStatus(productsStatus: string[] | string): string {
                return queryBuilderHelper.jsonWhereStatement('eventoutput.eventoutputdata', 'productStatus', Operators.IN, productsStatus)
            },
            snCheckLocation(snCheckLocations: string[] | string): string {
                const arr = Array.isArray(snCheckLocations) ? snCheckLocations : [snCheckLocations]
                let stmt = '('
                arr.forEach((latLong, index) => {
                    const [lat, long] = latLong.split(',')
                    const latWhereStmt = queryBuilderHelper.deepJsonWhereStatement(
                        'eventinput.eventinputdata',
                        ['snCheckLocation', 'latitude'],
                        Operators.EQL,
                        lat
                    )
                    const longWhereStmt = queryBuilderHelper.deepJsonWhereStatement(
                        'eventinput.eventinputdata',
                        ['snCheckLocation', 'longitude'],
                        Operators.EQL,
                        long
                    )
                    const condition = (index == 0) ? `(${latWhereStmt} AND ${longWhereStmt})` : `OR (${latWhereStmt} AND ${longWhereStmt})`
                    stmt += condition
                })
                stmt += ')'
                return stmt
            },
            snCheckResult(snCheckResults: string[] | string): string {
                return queryBuilderHelper.jsonWhereStatement('eventoutput.eventoutputdata', 'snCheckResult', Operators.IN, snCheckResults)
            },
        }

        const queryBuilder = await createQueryBuilder(Event, 'event')
            .innerJoinAndSelect('event.eventInputs', 'eventinput')
            .innerJoinAndSelect('event.eventOutputs', 'eventoutput')
            .addSelect("eventinput.eventinputdata::jsonb->>'productCode'", 'productcode')
            .addSelect("eventinput.eventinputdata::jsonb->>'batch'", 'batch')
            .addSelect("eventinput.eventinputdata::jsonb->>'expiryDate'", 'expirydate')
            .addSelect("eventinput.eventinputdata::jsonb->>'serialNumber'", 'serialnumber')
            .addSelect("eventoutput.eventoutputdata::jsonb->>'nameMedicinalProduct'", 'namemedicinalproduct')
            .addSelect("eventoutput.eventoutputdata::jsonb->>'snCheckResult'", 'sncheckresult')
            .addSelect("eventoutput.eventoutputdata::jsonb->>'productStatus'", 'productstatus')

        for (let [filterName, filterValue] of Object.entries(eventQuery)) {
            const whereFilter = whereFunctions[filterName]
            if (!!whereFilter) {
                queryBuilder.andWhere(whereFilter(filterValue))
            }
        }

        /** Order by */
        const sortProperties = {
            'createdOn': 'event.createdOn',
            'productCode': 'productcode',
            'batch': 'batch',
            'expiryDate': 'expirydate',
            'serialNumber': 'serialnumber',
            'nameMedicinalProduct': 'namemedicinalproduct',
            'snCheckResult': 'sncheckresult',
            'productStatus': 'productstatus'
        };
        const orderByProps = Array.isArray(eventQuery.sortProperty) ? eventQuery.sortProperty : [eventQuery.sortProperty];
        const orderByDirs = Array.isArray(eventQuery.sortDirection) ? eventQuery.sortDirection : [eventQuery.sortDirection];
        if (orderByProps.length != orderByDirs.length) {
            throw new BadRequestException('sortProperty and sortDirection must have the sane number of values')
        }
        for (let i = 0; i < orderByProps.length; i++) {
            const orderByProp = orderByProps[i];
            const sortProp = sortProperties[orderByProp];
            if (!sortProp) {
                throw new BadRequestException('sortProperty value unsupported. See possible values.');
            }
            const orderByDir = orderByDirs[i];
            // for undefined values
            if (!!orderByDir) {
                queryBuilder.addOrderBy(sortProp, orderByDir)
            }
        }
        queryBuilder.addOrderBy('event.eventId', 'DESC'); // one last sort property to force deterministic output

        const count = await queryBuilder.getCount()
        queryBuilder.take(eventQuery.limit)
        queryBuilder.skip(eventQuery.page * eventQuery.limit)

        const eventCollection = await queryBuilder.getMany()

        const metadata = {
            itemsCount: count,
            itemsPerPage: eventQuery.limit,
            currentPage: eventQuery.page,
            totalPages: Math.ceil(count / eventQuery.limit),
        }

        return {metadata, query: eventQuery, results: eventCollection}
    }
}
