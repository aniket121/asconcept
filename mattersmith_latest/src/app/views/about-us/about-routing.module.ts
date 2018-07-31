import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { CustomerComponent } from './about.component';
const routes: Routes = [
  {
    path: '',
    component: CustomerComponent,
    data: {
      title: 'about'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule {}
