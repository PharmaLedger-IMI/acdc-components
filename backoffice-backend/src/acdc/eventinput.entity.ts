import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {Event} from "./event.entity"
import {EventInputDataDto} from "./eventinput.dto";

@Entity("eventinput")
export class EventInput extends BaseEntity {

    @ApiProperty()
    @PrimaryGeneratedColumn("uuid", {name: "eventinputid"})
    eventInputId: string

    @ApiProperty()
    @Column({name: "eventid"})
    eventId: string

    @ApiProperty()
    @Column({name: "eventinputdata", type: 'json'})
    eventInputData: object

    @ManyToOne(() => Event, event => event.eventInputs)
    @JoinColumn({name: "eventid"})
    event: Event
}
