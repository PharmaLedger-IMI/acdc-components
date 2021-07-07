import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from '../message.service';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../acdc/user.model';
import {JwtHelperService} from '@auth0/angular-jwt';
import {LocalStorageService} from '../localstorage.service';

@Injectable()
export class AuthService {
  private authLoginUrl = environment.restBaseUrl+"/auth/login";
  private jwtStandaloneService: JwtHelperService;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private localStorageService: LocalStorageService
  ) {
    this.jwtStandaloneService = new JwtHelperService();
  }

  /**
   * Performs the login. Inspired on https://blog.angular-university.io/angular-jwt-authentication/
   * @param username
   * @param password in clear text
   * @returns Observable<{ token: string }>
   */
  login(username: string, password: string|undefined, callback: (err:any, data:any) => void) : void {
    // backend /auth/login returns token
    username = username && username.trim();
    this.http.post<{ token: string; }>(this.authLoginUrl, { username, password })
    .subscribe(
      (res: any) => {
        this.log(`posted ${username},${password}, ${res}`);
        if (!res.token || !res.email) {
          callback("Missing username/token field in "+JSON.stringify(res), null);
          return;
        }
        this.setSession(res);
        callback(null, res);
      },
      (err: any) => {
        callback(err, null);
      }
    );
  }

  private setSession(authResult: any): void {
    let user = new User();
    user.userid = authResult.userid;
    user.email = authResult.email;
    user.token = authResult.token;
    this.localStorageService.set(LocalStorageService.ACDC_USER, user);
  }

  public logout() {
    this.localStorageService.clear();
  }

  public hasAdminProfile() : boolean {
    if (this.isLoggedIn()) {
      const pdmUser = this.getUsername()!.endsWith('@pdmfc.com'); // jpsl - so far, only PDM are admins...
      const adminEmail = this.getUsername()! === 'admin@somecompany.com';
      return pdmUser || adminEmail;
    }
    return false;
  }

  public hasAnyProfile() : boolean {
    return this.isLoggedIn(); // && ...
  }

  public isLoggedIn(): boolean {
    const session = this.localStorageService.get(LocalStorageService.ACDC_USER);
    if (!!session) {
      const token = session.token;
      return !this.jwtStandaloneService.isTokenExpired(token);
    }
    return false;
  }

  public isLoggedOut() : boolean {
    return !this.isLoggedIn();
  }

  public getToken() : string | undefined {
    return this.getUser()?.token;
  }

  public getUser() : User | undefined {
    if (this.isLoggedIn()) {
      return this.localStorageService.get(LocalStorageService.ACDC_USER);
    } else {
      return undefined;
    }
  }

  public getUsername() : string | undefined {
    return this.getUser()?.email;
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
    this.messageService.add(`AuthService: ${message}`);
  }
}
