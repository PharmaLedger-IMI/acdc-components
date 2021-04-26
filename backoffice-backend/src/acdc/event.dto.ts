import {EventInput} from "./eventinput.entity";
import {EventOutput} from "./eventoutput.entity";

export class EventDto {
    readonly mahid: string
    readonly createdon: Date
    readonly eventdata: object
    readonly eventinputs: EventInput[]
    readonly eventoutputs: EventOutput[]
}