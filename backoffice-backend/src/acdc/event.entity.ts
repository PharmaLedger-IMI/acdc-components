import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {EventInput} from "./eventinput.entity";
import {EventOutput} from "./eventoutput.entity";

@Entity("event")
export class Event extends BaseEntity {

    @PrimaryGeneratedColumn("uuid", {name: "eventid"})
    eventId: string;

    @Column({name: "mahid"})
    @ApiProperty()
    mahId: string;

    @Column({name: "createdon", type: "timestamp"})
    @ApiProperty()
    createdOn: Date;

    @Column({name: "eventdata", type: 'json'})
    @ApiProperty()
    eventData: object;

    @OneToMany(() => EventInput, eventInput => eventInput.event)
    eventInputs: EventInput[];

    @OneToMany(() => EventOutput, eventOutput => eventOutput.event)
    eventOutputs: EventOutput[];
}