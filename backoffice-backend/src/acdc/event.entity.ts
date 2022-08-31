import {BaseEntity, Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {EventInput} from "./eventinput.entity";
import {EventOutput} from "./eventoutput.entity";
import { EventTraceability } from "./eventtraceability.dto";

@Entity("event")
export class Event extends BaseEntity {

    @ApiProperty()
    @PrimaryGeneratedColumn("uuid", {name: "eventid"})
    eventId: string;

    @ApiProperty()
    @Column({name: "mahid"})
    mahId: string;

    @ApiProperty()
    @Column({name: "createdon", type: "timestamp"})
    createdOn: Date;

    @ApiProperty()
    @Column({name: "eventdata", type: 'json'})
    eventData: object;

    @ApiProperty({ type: () => EventInput })
    @OneToMany(() => EventInput, eventInput => eventInput.event)
    eventInputs: EventInput[];

    @ApiProperty({ type: () => EventOutput })
    @OneToMany(() => EventOutput, eventOutput => eventOutput.event)
    eventOutputs: EventOutput[];

    @ApiProperty({ description: "Optional traceability information obtained from FGT."})
    traceability: EventTraceability;
}
