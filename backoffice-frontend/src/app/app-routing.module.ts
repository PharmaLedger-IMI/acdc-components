import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppResourceComponent } from './appresource/appresource.component';
import { AppResourceDetailComponent } from './appresource-detail/appresource-detail.component';
import { LoginComponent } from './login/login.component';
import { EventComponent } from './event/event.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { TodoComponent } from './todo/todo.component';

const routes: Routes = [
  {path: 'appresource', component: AppResourceComponent},
  {path: 'appresource/:id', component: AppResourceDetailComponent},
  {path: 'event', component: EventComponent},
  {path: 'event/:id', component: EventDetailComponent},
  {path: 'login', component: LoginComponent},
  {path: '', redirectTo: '/event', pathMatch: 'full'},
  {path: '**', component: TodoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
