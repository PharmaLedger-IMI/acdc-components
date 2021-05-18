import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform} from "@nestjs/common"
import {IsDateString, IsInt, IsOptional, IsString, Min, validate} from "class-validator"
import {plainToClass, Transform} from "class-transformer"

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
    readonly gtin: string

    @IsOptional()
    @IsString({each: true})
    readonly batch: string

    @IsOptional()
    @IsString({each: true})
    readonly serialNumber: string

    @IsOptional()
    @IsString({each: true})
    readonly productName: string

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
}