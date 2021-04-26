import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {Event} from "./event.entity";

@Entity("eventoutput")
export class EventOutput extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    eventoutputid: string

    @Column()
    @ApiProperty()
    eventid: string

    @Column({type: 'json'})
    @ApiProperty()
    eventoutputdata: object

    @ManyToOne(() => Event, event => event.eventoutput)
    @JoinColumn({name: 'eventid'})
    event: Event
}