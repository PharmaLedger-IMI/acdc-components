import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common"
import {IsDateString, IsEnum, IsInt, IsOptional, IsString, Matches, Min, validate} from "class-validator"
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
}

enum EventQuerySortDirection {
    asc = 'ASC',
    ASC = 'ASC',
    desc = 'DESC',
    DESC = 'DESC',
}

export class EventQuery {
    @IsOptional()
    @IsString({each: true})
    readonly eventId: string

    @IsOptional()
    @IsDateString()
    readonly createdOnStart: Date

    @IsOptional()
    @IsDateString()
    readonly createdOnEnd: Date

    @IsOptional()
    @IsString({each: true})
    readonly productCode: string

    @IsOptional()
    @IsString({each: true})
    readonly batch: string

    @IsOptional()
    @IsString({each: true})
    readonly serialNumber: string

    @IsOptional()
    @IsString({each: true})
    readonly nameMedicinalProduct: string

    @IsOptional()
    @IsString({each: true})
    readonly productStatus: string

    @IsOptional()
    @IsDateString()
    readonly expiryDateStart: Date

    @IsOptional()
    @IsDateString()
    readonly expiryDateEnd: Date

    @IsOptional()
    @IsString({each: true})
    readonly snCheckLocation: string

    @IsOptional()
    @IsString({each: true})
    readonly snCheckResult: string

    @IsOptional()
    @IsInt()
    @Min(1)
    @Transform(({value}) => parseInt(value))
    readonly limit: number = 10

    @IsOptional()
    @IsInt()
    @Min(0)
    @Transform(({value}) => parseInt(value))
    readonly page: number = 0

    @IsOptional()
    @IsEnum(EventQuerySortProperty, {each: true})
    readonly sortProperty: EventQuerySortProperty;

    @IsOptional()
    @Transform(({value}) => value.toUpperCase())
    @IsEnum(EventQuerySortDirection, {each: true})
    readonly sortDirection: EventQuerySortDirection;
}
