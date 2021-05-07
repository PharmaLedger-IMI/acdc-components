import {EventInputData} from '../eventinputdata.model';

export interface EventInput {
  eventInputId: string;
  eventId: string;
  eventInputData: EventInputData;
}
