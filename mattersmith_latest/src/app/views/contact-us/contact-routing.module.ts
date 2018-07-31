import { NgModule } from '@angular/core';
import { Routes,RouterModule } from '@angular/router';

import { UserComponent } from './contact.component';
const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    data: {
      title: 'contact'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
