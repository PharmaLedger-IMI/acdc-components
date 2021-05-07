import {EventInput} from './eventinput.model';
import {EventOutput} from '../eventoutput.model';

export interface Event {
  eventId: string;
  mahId: string;
  createdOn: Date;
  eventData: object;
  eventInputs: EventInput[];
  eventOutputs: EventOutput[];
}
