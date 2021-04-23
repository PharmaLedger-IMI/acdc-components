import {ApiProperty} from "@nestjs/swagger";

export class EventOuputDataDto {
    @ApiProperty({description: "Authentication status"})
    readonly SN_check_result: string

    @ApiProperty({description: "Marketing Authorization Holder identifier"})
    readonly MAH_ID: string
}

export class EventOutputDto {
    eventoutputdata: EventOuputDataDto
}