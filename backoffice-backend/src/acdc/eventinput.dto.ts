import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger"
import {IsDateString, IsNumber, IsObject, IsOptional, IsString, ValidateNested} from "class-validator";
import {Transform, Type} from "class-transformer";

export class Location {
    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Transform(({value}) => parseFloat(value))
    readonly latitude: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Transform(({value}) => parseFloat(value))
    readonly longitude: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Transform(({value}) => parseFloat(value))
    readonly altitude: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Transform(({value}) => parseFloat(value))
    readonly accuracy: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Transform(({value}) => parseFloat(value))
    readonly altitudeAccuracy: number;
}

export class EventInputDataDto {
    @ApiProperty({description: "GTIN, NTIN or PPN only"})
    @IsString()
    readonly productCode: string

    @ApiProperty({description: "Lot number or batch ID, up to 10 digits, alphanumeric"})
    @IsString()
    readonly batch: string

    @ApiProperty({description: "Serial number, up to 20 digits alphanumeric"})
    @IsString()
    readonly serialNumber: string

    @ApiProperty({description: "Expiration date in format: YYMMDD"})
    @IsString()
    readonly expiryDate: string

    @ApiProperty({description: "Date&time, when the check was requested YYYYMMDD_HHMMSS and timezone"})
    @IsDateString()
    readonly snCheckDateTime: Date

    @ApiPropertyOptional({description: "Location in geolocation attributes."})
    @IsObject()
    @ValidateNested({always: true})
    @Type(() => Location)
    readonly snCheckLocation: Location;
}

export class EventInputDto {
    eventInputData: EventInputDataDto
}
