import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger"

export class EventInputDataDto {
    @ApiProperty({description: "GTIN/NTIN"})
    readonly GTIN: string

    @ApiProperty({
        description: "Lot number or batch ID, up to 10 digits, alphanumeric"
    })
    readonly batch: string

    @ApiProperty({description: "Serial number, up to 20 digits alphanumeric"})
    readonly Serial_number: string

    @ApiProperty({description: "Name of the product"})
    readonly Product_name: string

    @ApiProperty({description: "Expiration date in format: YYMMDD"})
    readonly Expire_date: Date

    @ApiProperty({description: "Date&time, when the check was requested YYYYMMDD_HHMMSS and timezone"})
    readonly SN_check_date_time: Date

    @ApiPropertyOptional({
        description: "Location in longitude and latitude in format 'lat, long'"
    })
    readonly SN_check_location: string
}

export class EventInputDto {
    eventinputdata: EventInputDataDto
}