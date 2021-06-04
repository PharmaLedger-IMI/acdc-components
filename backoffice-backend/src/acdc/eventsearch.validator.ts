import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common"
import {IsDateString, IsEnum, IsInt, IsOptional, IsString, Matches, Min, validate} from "class-validator"
import {plainToClass, Transform} from "class-transformer"
import {ApiProperty} from "@nestjs/swagger";

@Injectable()
export class EventSearchValidator implements PipeTransform<EventSearchQuery> {
    async transform(value: object, metadata: ArgumentMetadata): Promise<EventSearchQuery> {
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

enum EventInputSortProperty {
    CREATEDON = 'createdOn',
}

enum EventInputSortDirection {
    asc = 'ASC',
    ASC = 'ASC',
    desc = 'DESC',
    DESC = 'DESC',
}

export class EventSearchQuery {
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
    @IsEnum(EventInputSortProperty, {each: true})
    readonly sortProperty: EventInputSortProperty;

    @IsOptional()
    @Transform(({value}) => value.toUpperCase())
    @IsEnum(EventInputSortDirection, {each: true})
    readonly sortDirection: EventInputSortDirection;
}
