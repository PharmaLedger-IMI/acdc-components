import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger"

export class EventInputDataDto {
    @ApiProperty({description: "GTIN/NTIN"})
    readonly gtin: string

    @ApiProperty({description: "Lot number or batch ID, up to 10 digits, alphanumeric"})
    readonly batch: string

    @ApiProperty({description: "Serial number, up to 20 digits alphanumeric"})
    readonly serialNumber: string

    @ApiProperty({description: "Name of the product"})
    readonly productName: string

    @ApiProperty({description: "Expiration date in format: YYMMDD"})
    readonly expiryDate: Date

    @ApiProperty({description: "Date&time, when the check was requested YYYYMMDD_HHMMSS and timezone"})
    readonly snCheckDateTime: Date

    @ApiPropertyOptional({description: "Location in latitude and longitude in format 'lat, long'"})
    readonly snCheckLocation: string
}

export class EventInputDto {
    eventInputData: EventInputDataDto
}