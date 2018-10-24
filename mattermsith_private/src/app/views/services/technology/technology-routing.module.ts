import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { TechnologyComponent } from './technology.component';

const routes: Routes = [
  {
    path: '',
    component: TechnologyComponent,
    data: {
      title: 'advice'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TechnologyRoutingModule {}
