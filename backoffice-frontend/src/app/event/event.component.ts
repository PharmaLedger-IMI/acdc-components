import {Component, OnInit, ViewChild} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';

import {Event} from '../acdc/event.model';
import {AppComponent} from '../app.component';
import {EventService} from '../event.service';
import {FormArray, FormBuilder, FormControl} from '@angular/forms';
import {MatChipInputEvent} from '@angular/material/chips';
import {ENTER} from '@angular/cdk/keycodes';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  constructor(private appComponent: AppComponent, private eventService: EventService, private formBuilder: FormBuilder) {
  }

  dataSource: MatTableDataSource<Event> = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort = new MatSort();
  filterPanelOpenState = false;

  /** chipsInputFilters are inputs that accept multiple values as input, used in filter form */
  chipsInputs: ChipInputFilter[] = [
    {label: 'Event ids', name: 'eventId', elements: []},
    {label: 'Batches', name: 'batch', elements: []},
    {label: 'Product Code', name: 'productCode', elements: []},
    {label: 'Serial Number', name: 'serialNumber', elements: []},
    {label: 'Name Medicinal Product', name: 'nameMedicinalProduct', elements: []},
    {label: 'Location (lat, long)', name: 'snCheckLocation', elements: []},
    {label: 'Check Result', name: 'snCheckResult', elements: []},
    {label: 'Product Status', name: 'productStatus', elements: []},
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
    checkColumns: new FormArray([])
  };

  /** MaterialTable Config */
  pageSizeOptions = [5, 10, 25, 50, 100];
  showFirstLastButtons = true;
  defaultColumns: string[] = ['eventId', 'createdOn', 'eventInputData', 'eventOutputData'];
  displayedColumns: string[] = this.defaultColumns;

  /** CheckInputs - columns to be show on Table */
  checksSelected: string[] = [];

  checkInputsDefault = [
    {label: 'Created On', value: 'createdOn'},
    {label: 'Event Input Data', value: 'eventInputData'},
    {label: 'Event Output Data', value: 'eventOutputData'},
  ];

  checkInputsCustom = [
    {label: 'Product Code', value: 'productCode'},
    {label: 'Batch', value: 'batch'},
    {label: 'Name Medicinal Product', value: 'nameMedicinalProduct'},
    {label: 'Expiry Date', value: 'expiryDate'},
    {label: 'Serial Number', value: 'serialNumber'},
    {label: 'Check Result', value: 'snCheckResult'},
    {label: 'Product Status', value: 'productStatus'},
  ];

  columnsData: { [key: string]: { label: string, data: any } } = {
    eventId: {
      label: 'Event Id',
      data: (event: Event) => event.eventId.slice(0, 8)
    },
    createdOn: {
      label: 'Created On',
      data: (event: Event) => this.datePrettify(event.createdOn)
    },
    eventInputData: {
      label: 'Event Inputs[0]',
      data: (event: Event) => event.eventInputs[0].eventInputData
    },
    eventOutputData: {
      label: 'Event Outputs[0]',
      data: (event: Event) => event.eventOutputs[0].eventOutputData
    },
    productCode: {
      label: 'Product Code',
      data: (event: Event) => event.eventInputs[0].eventInputData.productCode
    },
    batch: {
      label: 'Batch',
      data: (event: Event) => event.eventInputs[0].eventInputData.batch
    },
    nameMedicinalProduct: {
      label: 'Name Medicinal Product',
      data: (event: Event) => event.eventOutputs[0].eventOutputData.nameMedicinalProduct
    },
    productStatus: {
      label: 'Product Status',
      data: (event: Event) => event.eventOutputs[0].eventOutputData.productStatus
    },
    expiryDate: {
      label: 'Expiry Date',
      data: (event: Event) => event.eventInputs[0].eventInputData.expiryDate
    },
    serialNumber: {
      label: 'Serial Number',
      data: (event: Event) => event.eventInputs[0].eventInputData.serialNumber
    },
    snCheckResult: {
      label: 'Check Result',
      data: (event: Event) => event.eventOutputs[0].eventOutputData.snCheckResult
    }
  };

  /** Data handler capture any changes in dynamically attributes */
  dataHandlerForm = this.formBuilder.group(this.pageAttributesToHandle);

  get dataHandler(): DataHandlerForm {
    return this.dataHandlerForm.value;
  }

  set dataHandler(value: DataHandlerForm) {
    console.log('set data handler:', value);
    this.dataHandlerForm.patchValue(value);
  }

  /** Chips Input Config */
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER];

  /** Init function */
  ngOnInit(): void {
    this.appComponent.setNavMenuHighlight('data', 'event', 'List of Event (Scans performed by dummy users)');
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

        this.checksSelected = this.dataHandlerForm.get('checkColumns')?.value;
        this.displayedColumns = this.defaultColumns.concat(this.checksSelected);
        console.log('event.component.getEvents displayedColumns =', this.displayedColumns);

        this.dataHandler = {
          pageIndex: resp.meta.currentPage,
          pageSize,
          itemsCount: resp.meta.itemsCount,
          createdOnStart: this.dataHandler.createdOnStart,
          createdOnEnd: this.dataHandler.createdOnEnd,
          expiryDateStart: this.dataHandler.expiryDateStart,
          expiryDateEnd: this.dataHandler.expiryDateEnd,
        };

        this.dataSource = new MatTableDataSource(resp.items);
        this.dataSource.sortingDataAccessor = (event, property) => {
          return this.columnsData[property].data(event);
        };
        this.dataSource.sort = this.sort;
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

  /** Handle add user inputs in chip inputs
   * @param chipInputFilter - object metadata to identifier the chipInput
   * @param event - object input element from html DOM
   */
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

  /** Handle remove inputs in chip inputs
   * @param chipInputFilter - object metadata to identifier the chipInput
   * @param element - user input data (string)
   */
  handleRemoveChip(chipInputFilter: any, element: any): void {
    console.log('chips.remove -> chipInputFilter=', chipInputFilter);
    console.log('chips.remove -> element=', element);
    chipInputFilter.elements = chipInputFilter.elements.filter((r: any) => r !== element);
    console.log('event.component.handleRemoveChip dataHandler=', this.dataHandler);
    console.log('event.component.handleRemoveChip chipsInputFilters=', this.chipsInputs);
  }

  /** Handle the change of checkboxes in the selection of CUSTOM columns
   * @param event - object with checkBox status and input element from html DOM
   */
  handleCheckChange(event: any): void {
    const {checked, source} = event;
    const value = source.value;
    console.log('event.component.handleCheckChange change =', value, ' checked =', checked);
    const checkColumnsForm: FormArray = this.dataHandlerForm.get('checkColumns') as FormArray;

    if (checked) {
      checkColumnsForm.push(new FormControl(value));
    } else {
      const checkColumnsFormValues = this.dataHandlerForm.get('checkColumns')?.value;
      const index = checkColumnsFormValues.indexOf(value);
      checkColumnsForm.removeAt(index);
    }
    console.log('event.component.handleCheckChange dataHandler =', this.dataHandlerForm.get('checkColumns')?.value);
  }

  /** Handle the change of checkboxes in the selection of DEFAULT columns
   * * @param event - object with checkBox status and input element from html DOM
   */
  handleCheckChangeDefault(event: any): void {
    const {checked, source} = event;
    const value = source.value;
    console.log('event.component.handleCheckChange change =', value, ' checked =', checked);
    const defaultColumns = this.defaultColumns;

    if (checked) {
      defaultColumns.push(value);
    } else {
      const index = defaultColumns.indexOf(value);
      defaultColumns.splice(index, 1);
    }
    console.log('event.component.handleCheckChangeDefault checkForm =', defaultColumns);
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

interface DataHandlerForm {
  pageIndex: number;
  pageSize: number;
  itemsCount: number;
  createdOnStart: string;
  createdOnEnd: string;
  expiryDateStart: string;
  expiryDateEnd: string;
  checkColumns?: any;
}

interface ChipInputFilter {
  label: string;
  name: string;
  elements: string[];
}
