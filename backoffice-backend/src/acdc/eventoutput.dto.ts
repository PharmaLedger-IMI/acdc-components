import {ApiProperty} from "@nestjs/swagger";

export class EventOuputDataDto {
    @ApiProperty({description: "Authentication status"})
    snCheckResult: string

    @ApiProperty({required: true, description: "Name of the medicinal product"})
    nameMedicinalProduct: string

    @ApiProperty({required: true, description: "Status of the product"})
    productStatus: string

    @ApiProperty({required: false, description: "Marketing Authorization Holder identifier"})
    mahId: string | undefined

    @ApiProperty({required: false, description: "Marketing Authorization Holder name"})
    mahName: string | undefined
}

export class EventOutputDto {
    eventOutputData: EventOuputDataDto
}