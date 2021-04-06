import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { AppResource } from '../appresource';
import { AppResourceService } from '../appresource.service';

@Component({
  selector: 'app-appresource-search',
  templateUrl: './appresource-search.component.html',
  styleUrls: ['./appresource-search.component.css']
})
export class AppresourceSearchComponent implements OnInit {

  arcArray$: Observable<AppResource[]> | undefined;
  private searchTerms = new Subject<string>();

  constructor(private arcService: AppResourceService) {}


  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.arcArray$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.arcService.search(term)),
    );
  }

}
