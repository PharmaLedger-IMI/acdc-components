import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';

import {environment} from '../environments/environment';
import {MessageService} from './message.service';
import {Events} from './events.model';
import {Event} from './event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  private eventUrl = environment.restBaseUrl + '/acdc/event';
  private eventSearchUrl = environment.restBaseUrl + '/acdc/event/search';

  constructor(
    private http: HttpClient,
    private messageService: MessageService) {
  }

  /**
   * Perform API Request and get a list of events
   * @param page Number of page
   * @param limit Number of records in each page
   */
  getEvents(page: number, limit: number): Observable<Events> {
    const queryParams = `?page=${page}&limit=${limit}`;
    const url = `${this.eventSearchUrl + queryParams}`;
    this.messageService.add(`EventService: fetching eventCollection from ${url}`);

    return this.http.get<Events>(url)
      .pipe(
        tap(_ => this.log(`fetched Events`)),
        catchError(this.handleError<Events>('getEvents', null))
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
