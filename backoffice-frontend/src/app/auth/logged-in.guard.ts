// based on https://itnext.io/handle-restricted-routes-in-angular-with-route-guards-95c93be9d05e
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }
    
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): true|UrlTree {
        if ( this.authService.isLoggedIn() )
            return true;
        return this.router.parseUrl('/login');
    }
}