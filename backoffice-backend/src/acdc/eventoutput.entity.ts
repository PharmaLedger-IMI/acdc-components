import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {Event} from "./event.entity";
import {EventOuputDataDto} from "./eventoutput.dto";

@Entity("eventoutput")
export class EventOutput extends BaseEntity {

    @ApiProperty()
    @PrimaryGeneratedColumn("uuid", {name: "eventoutputid"})
    eventOutputId: string

    @ApiProperty()
    @Column({name: "eventid"})
    eventId: string

    @ApiProperty()
    @Column({name: "eventoutputdata", type: "json"})
    eventOutputData: object

    @ManyToOne(() => Event, event => event.eventOutputs)
    @JoinColumn({name: "eventid"})
    event: Event
}
