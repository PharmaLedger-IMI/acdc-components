import { Event } from './acdc/event.model';

export interface Events {
  meta: {
    itemsCount: number,
    itemsPerPage: number,
    currentPage: number,
    totalPages: number
  };
  items: Event[];
}
