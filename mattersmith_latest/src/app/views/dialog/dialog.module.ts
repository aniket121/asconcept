import { NgModule } from '@angular/core';

import { DialogComponent } from './dialog.component';
import { FormsModule } from '@angular/forms'


import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    FormsModule,
    CommonModule,
  ],
  providers: [      
  ],
  declarations: [ DialogComponent ],
  exports: [
        DialogComponent
    ]
})
export class DialogModule { }