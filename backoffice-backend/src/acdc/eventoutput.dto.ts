import {ApiProperty} from "@nestjs/swagger";

export class EventOuputDataDto {
    @ApiProperty({description: "Event unique identifier"})
    eventId: string;

    @ApiProperty({description: "Authentication status"})
    snCheckResult: string = 'Unsure'

    @ApiProperty({required: true, description: "Name of the medicinal product"})
    nameMedicinalProduct: string = 'Undefined'

    @ApiProperty({required: true, description: "Status of the product"})
    productStatus: string = 'Undefined'

    @ApiProperty({required: false, description: "Marketing Authorization Holder identifier"})
    mahId: string | undefined

    @ApiProperty({required: false, description: "Marketing Authorization Holder name"})
    mahName: string | undefined
}

export class EventOutputDto {
    eventOutputData: EventOuputDataDto
}
