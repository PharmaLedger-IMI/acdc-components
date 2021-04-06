import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../environments/environment';
import { MessageService } from './message.service';
import { AppResource } from './appresource';

@Injectable({
  providedIn: 'root'
})
export class AppResourceService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private arcUrl = environment.restBaseUrl+"/acdc/appresource";

  constructor(
      private http: HttpClient,
      private messageService: MessageService) { }

  getAppResources(): Observable<AppResource[]> {
      // TODO: send the message _after_ fetching the heroes
      this.messageService.add('AppResourceService: fetching arcCollection from '+this.arcUrl);
      //return of(APPRESOURCES);
      return this.http.get<AppResource[]>(this.arcUrl)
        .pipe(
          tap(_ => this.log(`fetched AppResources`)),
          catchError(this.handleError<AppResource[]>('getAppResources', []))
        );
  }

  getAppResource(id: number): Observable<AppResource> {
      const url = `${this.arcUrl}/${id}`;
      return this.http.get<AppResource>(url).pipe(
          tap(_ => this.log(`fetched hero id=${id}`)),
          catchError(this.handleError<AppResource>(`getAppResource id=${id}`))
      );
  }

  /** PUT: update the hero on the server */
  update(arc: AppResource): Observable<any> {
      return this.http.put(this.arcUrl, arc, this.httpOptions).pipe(
          tap(_ => this.log(`updated arc id=${arc.id}`)),
          catchError(this.handleError<any>('update'))
      );
  }

  /** POST: add a new hero to the server */
  add(arc: AppResource): Observable<AppResource> {
    return this.http.post<AppResource>(this.arcUrl, arc, this.httpOptions).pipe(
      tap((newArc: AppResource) => this.log(`added arc w/ id=${newArc.id}`)),
      catchError(this.handleError<AppResource>('add'))
    );
  }

  /** DELETE: delete the hero from the server */
  delete(arc: AppResource | number): Observable<AppResource> {
    const id = typeof arc === 'number' ? arc : arc.id;
    const url = `${this.arcUrl}/${id}`;

    return this.http.delete<AppResource>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted arc id=${id}`)),
      catchError(this.handleError<AppResource>('delete'))
    );
  }
  
  /* GET heroes whose name contains search term */
  search(term: string): Observable<AppResource[]> {
      if (!term.trim()) {
          // if not search term, return empty hero array.
          return of([]);
      }
      return this.http.get<AppResource[]>(`${this.arcUrl}/?term=${term}`).pipe(
          tap(x => x.length ?
              this.log(`found arc matching "${term}"`) :
              this.log(`no arc matching "${term}"`)),
          catchError(this.handleError<AppResource[]>('search', []))
      );
  }
  
  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);
 
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
      this.messageService.add(`AppResourceService: ${message}`);
  }

}
