import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { SuperadminComponent } from './superadmin.component';
const routes: Routes = [
  {
    path: '',
    component: SuperadminComponent,
    data: {
      title: 'SuperAdmin'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminRoutingModule {}