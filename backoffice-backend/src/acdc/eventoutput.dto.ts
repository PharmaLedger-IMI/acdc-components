import {ApiProperty} from "@nestjs/swagger";

export class EventOuputDataDto {
    @ApiProperty({description: "Authentication status"})
    snCheckResult: string

    @ApiProperty({required: false, description: "Marketing Authorization Holder identifier"})
    mahId: string | undefined

    @ApiProperty({required: false, description: "Marketing Authorization Holder name"})
    mahName: string | undefined
}

export class EventOutputDto {
    eventOutputData: EventOuputDataDto
}