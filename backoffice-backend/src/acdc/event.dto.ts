import {EventInput} from "./eventinput.entity";
import {EventOutput} from "./eventoutput.entity";

export class EventDto {
    readonly mahid: string
    readonly createdon: Date
    readonly eventdata: object
    readonly eventinput: EventInput[]
    readonly eventoutput: EventOutput[]
}