import {Component} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: []
})
export class SidebarComponent {

  sidebarItems: SidebarItem[] = [];

  constructor(private router: Router, private authService: AuthService) {
    router.events.subscribe((_: any) => {

      this.sidebarItems = [
        {
          title: true,
          label: 'Scan Data',
          display: authService.hasAnyProfile(),
        },
        {title: false, label: 'Event', route: 'event', icon: 'search', display: authService.hasAnyProfile()},
        {
          title: true,
          label: 'Rules',
          display: authService.hasAnyProfile(),
        },
        {label: 'Dashboard', route: 'rule', icon: 'assessment', display: authService.hasAnyProfile()},
        {
          title: true,
          label: 'Alerts',
          display: authService.hasAnyProfile(),
        },
        {label: 'Dashboard', route: 'alert', icon: 'timeline', display: authService.hasAnyProfile()},
        {
          title: true,
          label: 'Administration',
          display: authService.hasAdminProfile(),
        },
        {label: 'App Resource', route: 'appresource', icon: 'settings', display: authService.hasAdminProfile()},
        {label: 'App Locales', route: 'locales', icon: 'map', display: authService.hasAdminProfile()},
        {
          title: true,
          label: 'Login',
          display: authService.isLoggedOut(),
          icon: 'lock'
        },
        {
          title: false,
          label: 'Logout',
          route: 'login',
          display: authService.isLoggedIn(),
          icon: 'exit_to_app',
          onClick: () => {
            this.authService.logout();
          }
        }
      ];
    });
  }
}

export interface SidebarItem {
  title?: boolean;
  label: string;
  display?: boolean;
  route?: string;
  icon?: string;
  onClick?: any;
}
