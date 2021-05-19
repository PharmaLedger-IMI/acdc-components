import {EventInput} from "./eventinput.entity";
import {EventOutput} from "./eventoutput.entity";

export class EventDto {
    readonly mahId: string
    readonly createdOn: Date
    readonly eventData: object
    readonly eventInputs: EventInput[]
    readonly eventOutputs: EventOutput[]
}