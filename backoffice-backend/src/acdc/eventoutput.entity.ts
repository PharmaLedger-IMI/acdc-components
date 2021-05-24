import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {Event} from "./event.entity";
import {EventOuputDataDto} from "./eventoutput.dto";

@Entity("eventoutput")
export class EventOutput extends BaseEntity {

    @PrimaryGeneratedColumn("uuid", {name: "eventoutputid"})
    eventOutputId: string

    @Column({name: "eventid"})
    @ApiProperty()
    eventId: string

    @Column({name: "eventoutputdata", type: "json"})
    @ApiProperty()
    eventOutputData: object

    @ManyToOne(() => Event, event => event.eventOutputs)
    @JoinColumn({name: "eventid"})
    event: Event
}