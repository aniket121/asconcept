import { NgModule } from '@angular/core';
import { Routes,RouterModule } from '@angular/router';

import { KnowlegeComponent } from './knowlege.component';
const routes: Routes = [
  {
    path: '',
    component: KnowlegeComponent,
    data: {
      title: 'Knowlege'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowlegeRoutingModule {}
