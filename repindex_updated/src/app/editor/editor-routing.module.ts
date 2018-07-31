import { NgModule } from '@angular/core';
import { Routes,
     RouterModule } from '@angular/router';

import { editorComponent } from './editor.component';

const routes: Routes = [
  {
    path: '',
    component: editorComponent,
    data: {
      title: 'editor'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class editorRoutingModule {}
