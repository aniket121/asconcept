import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { superDashboardComponent } from './superdashboard.component';

const routes: Routes = [
  {
    path: '',
    component: superDashboardComponent,
    data: {
      title: 'superDashboard'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class superDashboardRoutingModule {}
