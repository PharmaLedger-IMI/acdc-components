import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppResourceComponent } from './appresource/appresource.component';
import { AppResourceDetailComponent } from './appresource-detail/appresource-detail.component';
import { LoginComponent } from './login/login.component';
import { LoggedInGuard } from './auth/logged-in.guard';
import { EventComponent } from './event/event.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { TodoComponent } from './todo/todo.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  {path: 'alert', component: TodoComponent, canActivate: [LoggedInGuard]},
  {path: 'appresource', component: AppResourceComponent, canActivate: [LoggedInGuard]},
  {path: 'appresource/:id', component: AppResourceDetailComponent, canActivate: [LoggedInGuard]},
  {path: 'event', component: EventComponent, canActivate: [LoggedInGuard]},
  {path: 'event/:id', component: EventDetailComponent, canActivate: [LoggedInGuard]},
  {path: 'locales', component: TodoComponent, canActivate: [LoggedInGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'rule', component: TodoComponent, canActivate: [LoggedInGuard]},
  {path: 'home', redirectTo: '/event'},
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
