import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {EventInput} from "./eventinput.entity";
import {EventOutput} from "./eventoutput.entity";

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

    @OneToMany(() => EventInput, eventinput => eventinput.event)
    eventinputs: EventInput[];

    @OneToMany(() => EventOutput, eventoutput => eventoutput.event)
    eventoutputs: EventOutput[];

}