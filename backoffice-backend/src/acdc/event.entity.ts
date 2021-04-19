import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity("event")
export class Event extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    eventid: string;

    @Column()
    @ApiProperty()
    mahid: string;

    @Column({type: "timestamp"})
    @ApiProperty()
    createdon: Date;

    @Column({type: 'json'})
    @ApiProperty()
    eventdata: object;
}