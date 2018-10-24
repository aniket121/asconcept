import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { NdaComponent } from './nda.component';

const routes: Routes = [
  {
    path: '',
    component: NdaComponent,
    data: {
      title: 'nda'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NdaRoutingModule {}
