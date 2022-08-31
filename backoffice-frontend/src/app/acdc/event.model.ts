import {EventInput} from './eventinput.model';
import {EventOutput} from './eventoutput.model';
import { EventTraceability } from './eventtraceability.model';

export interface Event {
  eventId: string;
  mahId: string;
  createdOn: Date;
  eventData: object;
  eventInputs: EventInput[];
  eventOutputs: EventOutput[];
  traceability: EventTraceability;
}
