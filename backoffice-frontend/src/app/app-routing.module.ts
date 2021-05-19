import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppResourceComponent } from './appresource/appresource.component';
import { AppResourceDetailComponent } from './appresource-detail/appresource-detail.component';
import { LoginComponent } from './login/login.component';
import { EventComponent } from './event/event.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { TodoComponent } from './todo/todo.component';
import { LoggedInGuard } from './auth/logged-in.guard';

const routes: Routes = [
  {path: 'appresource', component: AppResourceComponent, canActivate: [LoggedInGuard]},
  {path: 'appresource/:id', component: AppResourceDetailComponent, canActivate: [LoggedInGuard]},
  {path: 'event', component: EventComponent, canActivate: [LoggedInGuard]},
  {path: 'event/:id', component: EventDetailComponent, canActivate: [LoggedInGuard]},
  {path: 'login', component: LoginComponent},
  {path: '', redirectTo: '/login', pathMatch: "full"},
  {path: '**', component: TodoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
