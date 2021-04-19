import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity("eventinput")
export class EventInput extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    eventinputid: string;

    @Column()
    @ApiProperty()
    eventid: string;

    @Column({type: 'json'})
    @ApiProperty()
    eventinputdata: object;
}