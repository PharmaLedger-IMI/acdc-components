import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { AppComponent } from '../app.component';
import { AppResource } from '../appresource';
import { AppResourceService } from '../appresource.service';

@Component({
  selector: 'app-appresource-detail',
  templateUrl: './appresource-detail.component.html',
  styleUrls: ['./appresource-detail.component.css']
})
export class AppResourceDetailComponent implements OnInit {

  @Input() arc?: AppResource;

  constructor(
      private appComponent: AppComponent, 
      private route: ActivatedRoute,
      private arcService: AppResourceService,
      private location: Location
  ) {}

  ngOnInit(): void {
      this.appComponent.setNavMenuHighlight("admin", "appresource", "AppResource Detail");
      this.getAppResource();
  }

  getAppResource(): void {
      const idStr = this.route.snapshot.paramMap.get('id');
      if (!idStr) throw "request id is null";
      const id = +idStr;
      this.arcService.getAppResource(id)
         .subscribe(arc => this.arc = arc);
  }

  save(): void {
    if (!this.arc) throw "this.arc null";
    this.arcService.update(this.arc)
      .subscribe(() => this.goBack());
  }

  goBack(): void {
      this.location.back();
  }
}
