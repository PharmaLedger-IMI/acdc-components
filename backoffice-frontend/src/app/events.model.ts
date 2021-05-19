import { Event } from './event.model';

export interface Events {
  meta: {
    itemsCount: number,
    itemsPerPage: number,
    currentPage: number,
    totalPages: number
  };
  items: Event[];
}
