import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common"
import {IsDateString, IsEnum, IsInt, IsOptional, IsString, Min, validate} from "class-validator"
import {plainToClass, Transform} from "class-transformer"
import {ApiProperty} from "@nestjs/swagger";

@Injectable()
export class EventQueryValidator implements PipeTransform<EventQuery> {
    async transform(value: object, metadata: ArgumentMetadata): Promise<EventQuery> {
        console.log('eventinput.validator.transform raw=', value)
        const search = plainToClass(metadata.metatype, value)
        const errors = await validate(search, {skipMissingProperties: false, whitelist: true, transform: true})
        if (errors.length > 0) {
            const message = Object.values(errors[0].constraints).join(". ").trim()
            throw new BadRequestException(message)
        }
        console.log('eventinput.validator.transform return=', search)
        return search
    }
}

enum EventQuerySortProperty {
    CREATEDON = 'createdOn',
    PRODUCTCODE = 'productCode',
    BATCH = 'batch',
    EXPIRYDATE = 'expiryDate',
    SERIALNUMBER = 'serialNumber',
    NAMEMEDICINALPRODUCT = 'nameMedicinalProduct',
    SNCHECKRESULT = 'snCheckResult',
    PRODUCTSTATUS = 'productStatus'
}

enum EventQuerySortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class EventQuery {
    @ApiProperty({
        name: 'eventId',
        required: false,
        type: String,
        isArray: true,
        description: "Filter by exact match to event.id"
    })
    @IsOptional()
    @IsString({each: true})
    readonly eventId: string

    @ApiProperty({
        name: 'createdOnStart',
        required: false,
        type: Date,
        isArray: false,
        example: '2021-01-01',
        description: "Filter by greater or equal to event.createdOn"
    })
    @IsOptional()
    @IsDateString()
    readonly createdOnStart: Date

    @ApiProperty({
        name: 'createdOnEnd',
        required: false,
        type: Date,
        isArray: false,
        example: '2021-12-31',
        description: "Filter by less or equal to event.createdOn"
    })
    @IsOptional()
    @IsDateString()
    readonly createdOnEnd: Date

    @ApiProperty({
        name: 'productCode',
        required: false,
        type: String,
        isArray: true,
        description: "Filter by exact match to eventInput.productCode"
    })
    @IsOptional()
    @IsString({each: true})
    readonly productCode: string

    @ApiProperty({
        name: 'batch',
        required: false,
        type: String,
        isArray: true,
        description: "Filter by exact match to eventInput.batch"
    })
    @IsOptional()
    @IsString({each: true})
    readonly batch: string

    @ApiProperty({
        name: 'serialNumber',
        required: false,
        type: String,
        isArray: true,
        description: "Filter by exact match to eventInput.serialNumber"
    })
    @IsOptional()
    @IsString({each: true})
    readonly serialNumber: string

    @ApiProperty({
        name: 'nameMedicinalProduct',
        required: false,
        type: String,
        isArray: true,
        description: "Filter by exact match to eventOutput.nameMedicinalProduct"
    })
    @IsOptional()
    @IsString({each: true})
    readonly nameMedicinalProduct: string

    @ApiProperty({
        name: 'productStatus',
        required: false,
        type: String,
        isArray: true,
        description: "Filter by exact match to eventOutput.productStatus"
    })
    @IsOptional()
    @IsString({each: true})
    readonly productStatus: string

    @ApiProperty({
        name: 'snCheckLocation',
        required: false,
        type: String,
        isArray: true,
        description: "Filter by exact match to eventInput.snCheckLocation"
    })
    @IsOptional()
    @IsString({each: true})
    readonly snCheckLocation: string

    @ApiProperty({
        name: 'snCheckResult',
        required: false,
        type: String,
        isArray: true,
        description: "Filter by exact match to eventOutput.snCheckResult"
    })
    @IsOptional()
    @IsString({each: true})
    readonly snCheckResult: string

    @ApiProperty({
        name: 'limit',
        required: false,
        type: Number,
        isArray: false,
        description: "Number of results per page. Defaults to 10."
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Transform(({value}) => parseInt(value))
    readonly limit: number = 10

    @ApiProperty({
        name: 'page',
        required: false,
        type: Number,
        isArray: false,
        description: "Page number. Starts at zero. Defaults to zero."
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Transform(({value}) => parseInt(value))
    readonly page: number = 0

    @ApiProperty({
        name: 'sortProperty',
        required: false,
        isArray: true,
        description: `Sort property name. Possible values are ${Object.values(EventQuerySortProperty).join(', ')}. Defaults to createdOn DESC.`,
    })
    @IsOptional()
    @IsEnum(EventQuerySortProperty, {each: true})
    readonly sortProperty: EventQuerySortProperty = EventQuerySortProperty.CREATEDON;

    @ApiProperty({
        name: 'sortDirection',
        required: false,
        isArray: true,
        description: "Sort property order. Use ASC or DESC."
    })
    @IsOptional()
    @Transform(({value}) => {
        return Array.isArray(value) ? value.map(v => v.toUpperCase()) : value.toUpperCase()
    })
    @IsEnum(EventQuerySortDirection, {each: true})
    readonly sortDirection: EventQuerySortDirection = EventQuerySortDirection.DESC;
}
