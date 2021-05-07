import {EventOutputData} from '../eventoutputdata.model';

export interface EventOutput {
  eventOutputId: string;
  eventId: string;
  eventOutputData: EventOutputData;
}
