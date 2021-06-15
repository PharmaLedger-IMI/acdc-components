import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {environment} from '../environments/environment';
import {MessageService} from './message.service';
import {Events} from './acdc/events.model';
import {Event} from './acdc/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private http: HttpClient, private messageService: MessageService) {
  }

  private eventUrl = environment.restBaseUrl + '/acdc/event';
  private eventSearchUrl = environment.restBaseUrl + '/acdc/event/search';
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  /** Perform API Request and get a list of all events */
  getAllEvents(): Observable<Events> {
    const url = this.eventUrl;

    return this.http.get<Events>(url).pipe(
      tap(_ => this.log(`fetched Events`)),
      catchError(this.handleError<Events>('getEvents'))
    );
  }

  /**
   * Perform API Request and get a list of events
   * @param filters -> filters to apply in the Http request according to the API documentation for the "Event Search" route
   */
  getEvents(filters: SearchFilter[]): Observable<Events> {
    const url = this.eventSearchUrl;
    this.messageService.add(`EventService: fetching eventCollection from ${url}`);

    let params = new HttpParams();
    filters.forEach(filter => {
      if (Array.isArray(filter.value)) {
        filter.value.forEach(value => {
          params = params.append(filter.name, value);
        });
      } else {
        params = params.append(filter.name, filter.value);
      }
    });
    console.log('event.service.getEvents params=', params);

    return this.http.get<Events>(url, {params}).pipe(
      tap(_ => this.log(`fetched Events`)),
      catchError(this.handleError<Events>('getEvents'))
    );
  }


  /**
   * Perform API Request and get an event by id
   * @param eventId empty if not found
   */
  getEvent(eventId: string): Observable<Event> {
    const url = `${this.eventUrl}/${eventId}`;
    this.messageService.add(`EventService: fetching event id=${eventId} from ${url}`);
    return this.http.get<Event>(url).pipe(
      tap(_ => this.log(`fetched Event id=${eventId}`)),
      catchError(this.handleError<Event>(`getEvent id=${eventId}`))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: any): any {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string): void {
    this.messageService.add(`EventService: ${message}`);
  }

}

export interface SearchFilter {
  name: string;
  value: string;
}
