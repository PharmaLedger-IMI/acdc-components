import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {Event} from "./event.entity"
import {EventInputDataDto} from "./eventinput.dto";

@Entity("eventinput")
export class EventInput extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    eventinputid: string

    @Column()
    @ApiProperty()
    eventid: string

    @Column({type: 'json'})
    @ApiProperty()
    eventinputdata: EventInputDataDto

    @ManyToOne(() => Event, event => event.eventinputs)
    @JoinColumn({name: 'eventid'})
    event: Event
}