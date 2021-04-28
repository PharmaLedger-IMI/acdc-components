import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppResourceComponent } from './appresource/appresource.component';
import { AppResourceDetailComponent } from './appresource-detail/appresource-detail.component';
import { LoginComponent } from './login/login.component';
import { EventComponent } from './event/event.component';

const routes: Routes = [
  {path: 'appresource', component: AppResourceComponent},
  {path: 'appresource/:id', component: AppResourceDetailComponent},
  {path: 'event', component: EventComponent},
  {path: 'login', component: LoginComponent},
  {path: '', redirectTo: '/appresource', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
