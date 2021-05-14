import {Component, OnInit} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';

import {AppComponent} from '../app.component';
import {EventInputData} from '../acdc/eventinputdata.model';
import {EventOutputData} from '../acdc/eventoutputdata.model';
import {EventService} from '../event.service';
import {FormBuilder} from '@angular/forms';
import {Event} from '../acdc/event.model';
import {MatChipInputEvent} from '@angular/material/chips';
import {ENTER} from '@angular/cdk/keycodes';

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

  /** chipsInputFilters are inputs that accept multiple values as input, used in filter form */
  chipsInputs: ChipInputFilter[] = [
    {label: 'Event ids', name: 'eventId', elements: []},
    {label: 'Batches', name: 'batch', elements: []},
    {label: 'GTIN', name: 'gtin', elements: []},
    {label: 'Serial Number', name: 'serialNumber', elements: []},
    {label: 'Product Name', name: 'productName', elements: []},
    {label: 'Location (lat, long)', name: 'snCheckLocation', elements: []},
    {label: 'Check Result', name: 'snCheckResult', elements: []},
  ];

  /** Object for dynamically attributes/data */
  pageAttributesToHandle: DataHandlerForm = {
    pageIndex: 0,
    pageSize: 5,
    itemsCount: 10,
    createdOnStart: '',
    createdOnEnd: '',
    expiryDateStart: '',
    expiryDateEnd: '',
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
    console.log('set data handler:', value);
    this.dataHandlerForm.patchValue(value);
  }

  get filters(): any[] {
    const filters: any[] = [];

    this.chipsInputs.forEach(filter => {
      if (filter.elements.length > 0) {
        filters.push({
          name: filter.name,
          value: filter.elements
        });
      }
    });

    return filters;
  }

  /** Chips Input Config */
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER];

  /** Init function */
  ngOnInit(): void {
    this.appComponent.setNavMenuHighlight('admin', 'event', 'List of Event (scans performed by users)');
    this.getEvents(this.dataHandler.pageSize, this.dataHandler.pageIndex);
  }

  /** Perform API Request and made EventTableData interface
   * @param pageIndex Number of page
   * @param pageSize Number of records in each page
   */
  getEvents(pageSize: number, pageIndex: number): void {

    const filters: any[] = [
      {name: 'page', value: pageIndex},
      {name: 'limit', value: pageSize},
    ];

    const acceptFilterForm = ['createdOnStart', 'createdOnEnd', 'expiryDateStart', 'expiryDateEnd'];
    for (const [name, value] of Object.entries(this.dataHandler)) {
      if (acceptFilterForm.includes(name) && !!value) {
        filters.push({
          name,
          value
        });
      }
    }

    this.chipsInputs.forEach(filter => {
      if (filter.elements.length > 0) {
        filters.push({
          name: filter.name,
          value: filter.elements
        });
      }
    });

    console.log('event.component.getEvents filters=', filters);
    this.eventService.getEvents(filters)
      .subscribe((resp) => {
        this.dataHandler = {
          pageIndex: resp.meta.currentPage,
          pageSize,
          itemsCount: resp.meta.itemsCount,
          createdOnStart: this.dataHandler.createdOnStart,
          createdOnEnd: this.dataHandler.createdOnEnd,
          expiryDateStart: this.dataHandler.expiryDateStart,
          expiryDateEnd: this.dataHandler.expiryDateEnd,
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

  /** Listen filterForm/dataHandler, when form data is submitted, data is retrieved from the form by property "value" */
  handleFilter(): void {
    console.warn('event.component.handleFilter formSubmitted=', this.dataHandler);
    this.filterPanelOpenState = false;
    this.getEvents(this.dataHandler.pageSize, 0);
  }

  /** TODO */
  handleAddChip(chipInputFilter: any, event: MatChipInputEvent): void {
    console.log('chips.add -> chipInputFilter=', chipInputFilter);
    console.log('chips.add -> event=', event);
    const value = (event.value || '').trim();
    if (!!value && chipInputFilter.elements.lastIndexOf(value) < 0) {
      chipInputFilter.elements.push(value);
    }
    event.input.value = '';
    console.log('event.component.handleAddChip dataHandler=', this.dataHandler);
    console.log('event.component.handleAddChip chipsInputFilters=', this.chipsInputs);
  }

  /** TODO */
  handleRemoveChip(chipInputFilter: any, element: any): void {
    console.log('chips.remove -> chipInputFilter=', chipInputFilter);
    console.log('chips.remove -> element=', element);
    chipInputFilter.elements = chipInputFilter.elements.filter((r: any) => r !== element);
    console.log('event.component.handleRemoveChip dataHandler=', this.dataHandler);
    console.log('event.component.handleRemoveChip chipsInputFilters=', this.chipsInputs);
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
  createdOnStart: string;
  createdOnEnd: string;
  expiryDateStart: string;
  expiryDateEnd: string;
  chipsInputFilters?: any;
}

interface ChipInputFilter {
  label: string;
  name: string;
  elements: string[];
}
