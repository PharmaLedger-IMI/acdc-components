import { Event } from './event.model';

export interface Events {
  metadata: {
    itemsCount: number,
    itemsPerPage: number,
    currentPage: number,
    totalPages: number
  };
  results: Event[];
}
