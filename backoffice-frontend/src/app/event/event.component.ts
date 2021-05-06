import {Component, OnInit} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';

import {AppComponent} from '../app.component';
import {EventInputData} from '../eventinputdata.model';
import {EventOutputData} from '../eventoutputdata.model';
import {EventService} from '../event.service';
import {FormBuilder} from '@angular/forms';
import {Event} from '../event.model';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  constructor(private appComponent: AppComponent, private eventService: EventService, private formBuilder: FormBuilder) {
  }

  filterPanelOpenState = false;
  mapEvents?: Event[];

  /** MaterialTable Config */
  pageIndex = 0;
  pageSize = 5;
  pageCount = 1;
  pageSizeOptions = [5, 10, 25, 50, 100];
  showFirstLastButtons = true;
  displayedColumns: string[] = ['eventId', 'createdOn', 'eventInputData', 'eventOutputData'];
  dataSource: EventTableData[] = [];

  /** Data for query events from filter form */
  filterForm = this.formBuilder.group({
    startDate: '',
    endDate: '',
    pageSize: this.pageSize
  });

  private get filterFormValues(): any {
    return this.filterForm.value;
  }

  ngOnInit(): void {
    this.appComponent.setNavMenuHighlight('admin', 'event', 'List of Event (scans performed by users)');
    this.getEvents();
  }

  /** Perform API Request and made EventTableData interface
   * @param page Number of page
   * @param limit Number of records in each page
   */
  getEvents(): void {
    console.log(`event.component.getEvents page: ${this.pageIndex} limit: ${this.pageSize} startDate: ${this.filterFormValues.startDate}`);

    this.eventService.getEvents(this.pageIndex, this.pageSize, this.filterFormValues.startDate, this.filterFormValues.endDate)
      .subscribe((resp) => {
        this.pageCount = resp.meta.itemsCount;

        this.mapEvents = resp.items;

        this.dataSource = resp.items.map(event => {
          const eventId = event.eventId;
          const createdOn = this.datePrettify(event.createdOn);
          const eventInputData = event.eventInputs[0].eventInputData;
          const eventOutputData = event.eventOutputs[0].eventOutputData;
          return {eventId, createdOn, eventInputData, eventOutputData};
        });
      });
  }

  /** Listen actions in pagination component and do an action
   * @param pageEvent event metadata capture
   */
  handlePageEvent(pageEvent: PageEvent): void {
    console.warn('event.component.handlePageEvent pageEvent=', pageEvent);
    this.pageIndex = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;
    this.getEvents();
  }

  /** Listen filterForm, when form data is submitted, data is retrieved from the form by property "value" */
  handleFilter(): void {
    console.warn('event.component.handleFilter formSubmitted=', this.filterForm.value);
    this.pageIndex = 0;
    this.pageSize = this.filterForm.value.pageSize;
    this.filterPanelOpenState = false;
    this.getEvents();
  }

  /**
   * Prettify a javascript date to human format
   * @param date in format: YYYY-MM-dd HH-mm-ss
   */
  datePrettify = (date: Date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    return `${year}-${month}-${day} ${h}:${m}:${s}`;
  }
}

interface EventTableData {
  eventId: string;
  createdOn: string;
  eventInputData: EventInputData;
  eventOutputData: EventOutputData;
}
