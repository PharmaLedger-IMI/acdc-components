import { Injectable } from '@angular/core';
import {Observable, of, OperatorFunction} from 'rxjs';
import {MessageService} from './message.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';

import { environment } from '../environments/environment';
import {Locale} from './locale';


@Injectable({
  providedIn: 'root'
})
export class LocaleService {

  private localeEndpoint = environment.restBaseUrl+"/acdc/locale";
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient, private messageService: MessageService) { }

  getLocales(): Observable<Locale[]>{
    this.messageService.add('LocaleService: fetching locales');
    return this.http.get<Locale[]>(this.localeEndpoint)
      .pipe(
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<Locale[]>('getLocales', []))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T): OperatorFunction<T, T>{
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  private log(message: string): void {
    this.messageService.add(`LocaleService: ${message}`);
  }

  getLocale(code: string): Observable<Locale>{
    const url = `${this.localeEndpoint}/${code}`;
    return this.http.get<Locale>(url)
      .pipe(
        tap(_ => this.log(`fetched locale code=${code}`)),
        catchError(this.handleError<Locale>(`getLocale code=${code}`))
      );
  }

  updateLocale(locale: Locale): Observable<any> {
    return this.http.put(this.localeEndpoint, locale, this.httpOptions).pipe(
      tap(_ => this.log(`updated locale code=${locale.code}`)),
      catchError(this.handleError<Locale>('updateLocale'))
    );
  }

  addLocale(locale: Locale): Observable<any> {
    return this.http.post(this.localeEndpoint, locale, this.httpOptions)
      .pipe(
        tap(_ => this.log(`created locale=${locale}`)),
        catchError(this.handleError<Locale>('saveLocale'))
      );
  }

  deleteLocale(locale: Locale | string): Observable<any> {
    const code = typeof locale === 'string' ? locale : locale.code;
    const url = `${this.localeEndpoint}/${code}`;
    return this.http.delete(url, this.httpOptions)
      .pipe(
        tap(_ => this.log(`deleted locale code =${code}`)),
        catchError(this.handleError<Locale>('deleteLocale'))
      );
  }

  searchLocales(term: string): Observable<Locale[]>{
    if (!term.trim()) {
      return of([]);
    }
    return this.http.get<Locale[]>(`${this.localeEndpoint}/search/?code=${term}`)
      .pipe(
        tap(x => x.length ?
          this.log(`found locales matching ${term}`) :
          this.log(`no locales matching ${term}`)),
        catchError(this.handleError<Locale[]>('searchLocales', []))
      );
  }
}
