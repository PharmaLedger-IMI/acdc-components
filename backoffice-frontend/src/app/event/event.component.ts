import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';

import {Event} from '../acdc/event.model';
import {AppComponent} from '../app.component';
import {EventService} from '../event.service';
import {FormArray, FormBuilder} from '@angular/forms';
import {MatChipInputEvent} from '@angular/material/chips';
import {ENTER} from '@angular/cdk/keycodes';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort, Sort, SortDirection} from '@angular/material/sort';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {first} from 'rxjs/operators';
import {LocalStorageService} from '../localstorage.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  constructor(
    private appComponent: AppComponent,
    private eventService: EventService,
    private formBuilder: FormBuilder,
    private ngZone: NgZone,
    private localStorageService: LocalStorageService) {
  }

  dataSource: MatTableDataSource<Event> = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  /** chipsInputFilters are inputs that accept multiple values as input, used in filter form */
  chipsInputs: ChipInputFilter[] = [
    {label: 'Event ids', name: 'eventId', elements: []},
    {label: 'Batches', name: 'batch', elements: []},
    {label: 'Product Code', name: 'productCode', elements: []},
    {label: 'Serial Number', name: 'serialNumber', elements: []},
    {label: 'Name Medicinal Product', name: 'nameMedicinalProduct', elements: []},
    {label: 'Location (lat, long)', name: 'snCheckLocation', elements: []},
    {
      label: 'Check Result', name: 'snCheckResult', elements: [], autocompleteOptions: [
        'Authentic', 'Suspect', 'TimeOut', 'UserAbort', 'Unsure'
      ]
    },
    {
      label: 'Product Status', name: 'productStatus', elements: [], autocompleteOptions: [
        'Released to market', 'Not released', 'Not registered', 'Reported stolen', 'Reported destroyed', 'Reported suspect'
      ]
    },
  ];

  tableDefaultColumns: ChekBox[] = [
    {label: 'Created On', key: 'createdOn', visible: true},
    {label: 'Event Input Data', key: 'eventInputData', visible: true},
    {label: 'Event Output Data', key: 'eventOutputData', visible: true},
  ];

  tableCustomColumns: ChekBox[] = [
    {label: 'Product Code', key: 'productCode', visible: false},
    {label: 'Batch', key: 'batch', visible: false},
    {label: 'Name Medicinal Product', key: 'nameMedicinalProduct', visible: false},
    {label: 'Expiry Date', key: 'expiryDate', visible: false},
    {label: 'Serial Number', key: 'serialNumber', visible: false},
    {label: 'Check Result', key: 'snCheckResult', visible: false},
    {label: 'Product Status', key: 'productStatus', visible: false},
  ];

  public viewer: Viewer = {
    customColumnSelector: [],
    pageSizeOptions: [5, 10, 25, 50, 100, 500, 1000],
    showFirstLastButtons: true,
    tableDataRetriever: {
      eventId: {
        label: 'Event Id',
        data: (event: Event) => event.eventId.slice(0, 8).toUpperCase(),
      },
      createdOn: {
        label: 'Created On',
        data: (event: Event) => this.datePrettify(event.createdOn)
      },
      eventInputData: {
        label: 'Event Inputs[0]',
        data: (event: Event) => {
          const eventInputData = event.eventInputs[0].eventInputData;
          delete eventInputData.did;
          return eventInputData;
        }
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
        data: (event: Event) => event.eventOutputs[0].eventOutputData.productStatus,
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
        data: (event: Event) => event.eventOutputs[0].eventOutputData.snCheckResult,
        cssClasses: (event: Event) => {
          const productStatus = event.eventOutputs[0].eventOutputData.snCheckResult;
          const style = 'font-bold ';
          if (productStatus === 'Authentic') {
            return style + 'text-success';
          } else if (productStatus === 'Suspect') {
            return style + 'text-danger';
          }
          return style + 'text-warning';
        }
      }
    },
    chipsConfig: {
      visible: true,
      selectable: true,
      removable: true,
      addOnBlur: true,
      separatorKeysCodes: [ENTER],
    }
  };

  get tableDataRetriever(): TableDataRetriever {
    return this.viewer.tableDataRetriever;
  }

  public handler: Handler = {
    displayedColumns: [],
    filterPanelOpen: false,
    isLoadingResults: true,
    selectedTabIndex: 0,
    tableManager: {
      pageIndex: 0,
      pageSize: 5,
      itemsCount: 10,
      createdOnStart: '',
      createdOnEnd: '',
      sortProperty: 'createdOn',
      sortDirection: 'desc',
      multipleInputFilters: this.formBuilder.array(this.chipsInputs),
      defaultColumns: this.formBuilder.array(this.tableDefaultColumns),
      customColumns: this.formBuilder.array(this.tableCustomColumns)
    }
  };

  tableManagerForm = this.formBuilder.group(this.handler.tableManager);

  get tableManager(): TableManager {
    return this.tableManagerForm.value;
  }

  set tableManager(value: TableManager) {
    console.log('set data handler @valueReceived', value);
    this.tableManagerForm.patchValue(value, {emitEvent: false});
    this.localStorageService.set(LocalStorageService.EVENT_PAGE, this.tableManagerForm.value);
    console.log('get data handler @cache =', this.localStorage);
  }

  get multipleInputFilters(): FormArray {
    return this.tableManagerForm.get('multipleInputFilters') as FormArray;
  }

  get tableManagerDefaultColumns(): FormArray {
    return this.tableManagerForm.get('defaultColumns') as FormArray;
  }

  get tableManagerCustomColumns(): FormArray {
    return this.tableManagerForm.get('customColumns') as FormArray;
  }

  get localStorage(): any {
    return this.localStorageService.get(LocalStorageService.EVENT_PAGE) || {};
  }

  set selectedTabIndex(index: number) {
    this.handler.selectedTabIndex = index;
    this.localStorageService.set('selected_tab', index);
  }

  ngOnInit(): void {
    this.appComponent.setNavMenuHighlight('data', 'event', 'List of Event (Scans performed by users)');
    caches.has(LocalStorageService.EVENT_PAGE).then(() => {
      console.log('event.component.ngOnInit @tableManager =', this.tableManager);
      this.tableManager = this.localStorage;
      console.log('event.component.ngOnInit @tableManager.cache', this.tableManager);
    }).finally(() => {
      this.getEvents(this.tableManager.pageSize, this.tableManager.pageIndex);
      if (!!this.dataSource) {
        this.selectedTabIndex = this.localStorageService.get('selected_tab') || 0;
      }
    });
  }

  /** Perform API Request and made EventTableData interface
   * @param pageIndex Number of page
   * @param pageSize Number of records in each page
   */
  getEvents(pageSize: number, pageIndex: number): void {
    this.handler.isLoadingResults = true;
    const filters: any[] = [
      {name: 'page', value: pageIndex},
      {name: 'limit', value: pageSize},
    ];

    const acceptFilterForm = ['createdOnStart', 'createdOnEnd', 'sortDirection', 'sortProperty'];
    for (const [name, value] of Object.entries(this.tableManager)) {
      if (acceptFilterForm.includes(name) && !!value) {
        filters.push({
          name,
          value
        });
      }
    }

    this.multipleInputFilters.controls.forEach(chipInput => {
      const input = chipInput.value;
      if (input.elements.length > 0) {
        filters.push({
          name: input.name,
          value: input.elements
        });
      }
    });

    const colsToDisplay = ['eventId'];
    const cols = this.tableManagerDefaultColumns.value.concat(this.tableManagerCustomColumns.value);
    cols.forEach((column: ChekBox) => {
      if (column.visible) {
        colsToDisplay.push(column.key);
      }
    });

    console.log('event.component.getEvents filters=', filters);
    this.eventService.getEvents(filters).subscribe((resp) => {

      this.handler.displayedColumns = colsToDisplay;
      console.log('event.component.getEvents displayedColumns =', this.handler.displayedColumns);

      this.tableManager = {
        pageIndex: resp.metadata.currentPage,
        pageSize,
        itemsCount: resp.metadata.itemsCount,
        sortDirection: this.tableManager.sortDirection,
        sortProperty: this.tableManager.sortProperty
      };

      this.dataSource = new MatTableDataSource(resp.results);
      this.dataSource.sortingDataAccessor = (event, property) => {
        return this.tableDataRetriever[property].data(event);
      };
      this.dataSource.sort = this.sort;

      this.ngZone.onStable.pipe(first()).subscribe(() => {
        this.handler.isLoadingResults = false;
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

  /** Listen filterForm/tableManager, when form data is submitted, data is retrieved from the form by property "value" */
  handleFilter(): void {
    console.warn('event.component.handleFilter formSubmitted=', this.tableManager);
    this.handler.filterPanelOpen = false;
    this.getEvents(this.tableManager.pageSize, 0);
  }

  /** Handle add user inputs in chip inputs
   * @param chipInputFilter - object metadata to identifier the chipInput
   * @param event - object input element from html DOM
   */
  handleAddChip(chipInputFilter: any, event: MatChipInputEvent | MatAutocompleteSelectedEvent): void {
    console.log('chips.add -> chipInputFilter=', chipInputFilter);
    console.log('chips.add -> event=', event);
    let value: string;
    if ((event instanceof MatAutocompleteSelectedEvent)) {
      value = event.option.viewValue;
    } else {
      value = (event.value || '').trim();
      event.input.value = '';
    }

    if (!!value && chipInputFilter.value.elements.indexOf(value) < 0) {
      chipInputFilter.value.elements.push(value);
    }
    console.log('event.component.handleAddChip chipsInputFilters=', this.chipsInputs);
  }

  /** Handle remove inputs in chip inputs
   * @param chipInputFilter - object metadata to identifier the chipInput
   * @param element - user input data (string)
   */
  handleRemoveChip(chipInputFilter: any, element: any): void {
    console.log('chips.remove -> chipInputFilter=', chipInputFilter);
    console.log('chips.remove -> element=', element);
    chipInputFilter.value.elements = chipInputFilter.value.elements.filter((r: any) => r !== element);
    console.log('event.component.handleRemoveChip chipsInputFilters=', this.tableManager.multipleInputFilters);
  }

  /** Handle the change of checkboxes in the selection of CUSTOM columns
   * @param event - object with checkBox status and input element from html DOM
   * @param checkBox -
   */
  handleCustomColumnSelector(event: any, checkBox: any): void {
    const {checked} = event;
    checkBox.value.visible = checked;
    console.log(
      'event.component.handleCustomColumnSelector',
      '@column =', checkBox.value.key,
      '@visible =', checkBox.value.visible,
      '@values =', this.tableManagerCustomColumns.value
    );
  }

  /** Handle the change of checkboxes in the selection of DEFAULT columns
   * * @param event - object with checkBox status and input element from html DOM
   * @param checkBox -
   */
  handleDefaultColumnSelector(event: any, checkBox: any): void {
    const {checked} = event;
    checkBox.value.visible = checked;
    console.log(
      'event.component.handleDefaultColumnSelector',
      '@column =', checkBox.value.key,
      '@visible =', checkBox.value.visible,
      '@values =', this.tableManagerDefaultColumns.value
    );
  }

  /**
   * Handle the sort event columns in the event table
   * @param event - sort object changed
   */
  handleSortData(event: Sort): void {
    const {active, direction} = event;
    this.tableManager.sortDirection = direction;
    this.tableManager.sortProperty = active;
    this.getEvents(this.tableManager.pageSize, 0);
  }

  handleDownloadScans(): void {
    this.eventService.getAllEvents().subscribe((res: any) => {
      const fileName = this.datePrettify(new Date());
      this.downloadByHtmlElement(`${fileName}-acdc-scans`, JSON.stringify(res));
    });
  }

  handleChangeTab(event: any): void {
    this.selectedTabIndex = event.index;
    console.log('##', this.handler.selectedTabIndex);
    console.log('##', event);
    this.handler.isLoadingResults = true;
    this.ngZone.onStable.pipe(first()).subscribe(() => {
      this.handler.isLoadingResults = false;
    });
  }

  /** Create html tag to emit download event */
  private downloadByHtmlElement(fileName: string, content: string): void {
    const htmlElement = document.createElement('a');
    const fileType = 'text/plain';
    htmlElement.setAttribute(
      'href',
      `data:${fileType};charset=utf-8,${encodeURIComponent(content)}`
    );
    htmlElement.setAttribute('download', fileName);
    const event = new MouseEvent('click');
    htmlElement.dispatchEvent(event);
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
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${h}:${m}:${s}`;
  }
}

interface CustomInput {
  label: string;
  value: string;
}

interface TableDataRetriever {
  [key: string]: {
    label: string,
    data: any,
    cssClasses?: any
  };
}

interface ChipConfig {
  visible: boolean;
  selectable: boolean;
  removable: boolean;
  addOnBlur: boolean;
  readonly separatorKeysCodes: number[];
}

interface Viewer {
  customColumnSelector: string[];
  pageSizeOptions: number[];
  showFirstLastButtons: boolean;
  tableDataRetriever: TableDataRetriever;
  chipsConfig: ChipConfig;
}

interface ChipInputFilter {
  label: string;
  name: string;
  elements: string[];
  autocompleteOptions?: string[];
}

interface ChekBox {
  label: string;
  key: string;
  visible: boolean;
}

interface TableManager {
  pageIndex: number;
  pageSize: number;
  itemsCount: number;
  createdOnStart?: string;
  createdOnEnd?: string;
  sortProperty: string;
  sortDirection: SortDirection;
  multipleInputFilters?: any;
  defaultColumns?: any;
  customColumns?: any;
}

interface Handler {
  displayedColumns: string[];
  filterPanelOpen: boolean;
  isLoadingResults: boolean;
  selectedTabIndex?: number;
  tableManager: TableManager;
}

