import { ChangeDetectorRef } from '@angular/core';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { VERSION } from 'src/environments/version';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Anti-Counterfeiting Data Collaboration Backoffice';
  sideNavOpened = true;
  sideNavMenu1Item = "";
  sideNavMenu2Item = "login";
  sideTime = new Date();
  v = VERSION;

  constructor(
    private titleService: Title,
    private cdRef: ChangeDetectorRef,
    public authService: AuthService,
  ) { }

  public setNavMenuHighlight(menu1 : string, menu2 : string, aTitle? : string) {
    this.sideNavMenu1Item = menu1;
    this.sideNavMenu2Item = menu2;
    this.sideTime = new Date();
    this.title = aTitle || "ACDC DEMONSTRATOR";
    if (aTitle && !aTitle.startsWith("ACDC DEMONSTRATOR ")) {
      this.titleService.setTitle("ACDC DEMONSTRATOR - "+aTitle);
    } else {
      this.titleService.setTitle(this.title);
    }
    this.cdRef.detectChanges(); // avoid error NG0100: ExpressionChangedAfterItHasBeenCheckedError
  }

  public logout() {
    this.authService.logout();
    this.setNavMenuHighlight("", "login");
  }
}
