import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { DialogComponent } from './dialog.component';
const routes: Routes = [
  {
    path: '',
    component: DialogComponent,
    data: {
      title: 'DialogComponent'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DialogComponentRoutingModule {}
