import {ApiProperty} from "@nestjs/swagger";

export class EventOuputDataDto {
    @ApiProperty({description: "Authentication status"})
    readonly snCheckResult: string

    @ApiProperty({description: "Marketing Authorization Holder identifier"})
    readonly mahId: string
}

export class EventOutputDto {
    eventOutputData: EventOuputDataDto
}