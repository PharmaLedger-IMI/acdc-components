import { Component, OnInit } from '@angular/core';

import { AppComponent } from '../app.component';
import { AppResource } from '../acdc/appresource.model';
import { AppResourceService } from '../appresource.service';

@Component({
  selector: 'app-appresource',
  templateUrl: './appresource.component.html',
  styleUrls: ['./appresource.component.css']
})
export class AppResourceComponent implements OnInit {

  /* arc: AppResource = {
      id: 1,
      key: 'x',
      locale: { code: "en" },
      value: 'value',
      help: 'help'
  }; */ // not used anymore

  arcCollection: AppResource[] = []; /* collection of all AppResources */

  //constructor() { }
  constructor(
    private appComponent: AppComponent, 
    private arcService: AppResourceService
  ) {}

  ngOnInit(): void {
      this.appComponent.setNavMenuHighlight("admin", "appresource", "List of AppResource (configuration settings)");
      this.getAppResources();
  }

  getAppResources(): void {
    this.arcService.getAppResources()
        .subscribe(arcArray => this.arcCollection = arcArray);
  }

  add(arcKey: string, arcValue: string, arcHelp: string): void {
    this.arcService.add({ key: arcKey, value: arcValue, help: arcHelp } as AppResource)
      .subscribe(arc => this.arcCollection.push(arc));
  }

  delete(arc: AppResource): void {
    this.arcCollection = this.arcCollection.filter(arc2 => arc2 !== arc);
    this.arcService.delete(arc).subscribe();
  }
}
