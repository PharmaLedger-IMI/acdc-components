// based on https://itnext.io/handle-restricted-routes-in-angular-with-route-guards-95c93be9d05e
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }
    canActivate(): Observable<boolean> | Promise<boolean> | boolean {
        return this.authService.isLoggedIn();
    }
}