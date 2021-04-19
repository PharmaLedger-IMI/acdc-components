import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity("eventoutput")
export class EventOutput extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    eventoutputid: string;

    @Column()
    @ApiProperty()
    eventid: string;

    @Column({type: 'json'})
    @ApiProperty()
    eventoutputdata: object;
}