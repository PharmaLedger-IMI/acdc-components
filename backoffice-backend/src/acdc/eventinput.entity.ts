import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {Event} from "./event.entity"
import {EventInputDataDto} from "./eventinput.dto";

@Entity("eventinput")
export class EventInput extends BaseEntity {

    @PrimaryGeneratedColumn("uuid", {name: "eventinputid"})
    eventInputId: string

    @Column({name: "eventid"})
    @ApiProperty()
    eventId: string

    @Column({name: "eventinputdata", type: 'json'})
    @ApiProperty()
    eventInputData: object

    @ManyToOne(() => Event, event => event.eventInputs)
    @JoinColumn({name: "eventid"})
    event: Event
}