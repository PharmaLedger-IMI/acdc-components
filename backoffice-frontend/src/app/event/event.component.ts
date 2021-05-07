import {Component, OnInit} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';

import {AppComponent} from '../app.component';
import {EventInputData} from '../eventinputdata.model';
import {EventOutputData} from '../eventoutputdata.model';
import {EventService} from '../event.service';
import {FormBuilder} from '@angular/forms';
import {Event} from '../acdc/event.model';

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

  /** Object for dynamically attributes/data */
  private pageAttributesToHandle: DataHandlerForm = {
    pageIndex: 0,
    pageSize: 5,
    itemsCount: 10,
    startDate: '',
    endDate: ''
  };

  /** MaterialTable Config */
  pageSizeOptions = [5, 10, 25, 50, 100];
  showFirstLastButtons = true;
  displayedColumns: string[] = ['eventId', 'createdOn', 'eventInputData', 'eventOutputData'];
  dataSource: EventTableData[] = [];

  /** Data handler capture any changes in dynamically attributes */
  dataHandlerForm = this.formBuilder.group(this.pageAttributesToHandle);

  get dataHandler(): DataHandlerForm {
    return this.dataHandlerForm.value;
  }

  set dataHandler(value: DataHandlerForm) {
    this.dataHandlerForm.patchValue(value);
  }

  ngOnInit(): void {
    this.appComponent.setNavMenuHighlight('admin', 'event', 'List of Event (scans performed by users)');
    this.getEvents(this.dataHandler.pageSize, this.dataHandler.pageIndex);
  }

  /** Perform API Request and made EventTableData interface
   * @param pageIndex Number of page
   * @param pageSize Number of records in each page
   */
  getEvents(pageSize: number, pageIndex: number): void {
    console.log(`event.component.getEvents page: ${pageIndex} pageSize: ${pageSize} startDate: ${this.dataHandler.startDate} endDate: ${this.dataHandler.endDate}`);

    this.eventService.getEvents(pageIndex, pageSize, this.dataHandler.startDate, this.dataHandler.endDate)
      .subscribe((resp) => {
        this.dataHandler = {
          pageIndex: resp.meta.currentPage,
          pageSize: pageSize > resp.meta.itemsCount ? resp.meta.itemsCount : resp.meta.itemsPerPage,
          itemsCount: resp.meta.itemsCount,
          startDate: this.dataHandler.startDate,
          endDate: this.dataHandler.endDate,
        };
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
    this.getEvents(pageEvent.pageSize, pageEvent.pageIndex);
  }

  /** Listen filterForm, when form data is submitted, data is retrieved from the form by property "value" */
  handleFilter(): void {
    console.warn('event.component.handleFilter formSubmitted=', this.dataHandler);
    this.filterPanelOpenState = false;
    this.getEvents(this.dataHandler.pageSize, 0);
  }

  /**
   * Prettify a javascript date to human format
   * @param date in format: YYYY-MM-dd HH-mm-ss
   */
  datePrettify(date: Date): string {
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

interface DataHandlerForm {
  pageIndex: number;
  pageSize: number;
  itemsCount: number;
  startDate: string;
  endDate: string;
}
