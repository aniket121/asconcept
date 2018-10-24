import { NgModule } from '@angular/core';

import { ReviewComponent } from './review.component';
import { ReviewRoutingModule } from './review-routing.module';
import { FormsModule } from '@angular/forms'

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from '../../interceptor'

// import { DialogComponent } from '../dialog/dialog.component';
import { CommonModule } from '@angular/common';
//import { DialogModule } from '../dialog/dialog.module';

import { DataTableModule, DropdownModule } from 'primeng/primeng'; // Here
import {GrowlModule} from 'primeng/growl';
import {DialogModule} from 'primeng/dialog';
import {MessageService} from 'primeng/components/common/messageservice';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';


@NgModule({
  imports: [
    ReviewRoutingModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    DataTableModule,
    DialogModule,
    MultiselectDropdownModule,
    DropdownModule,
    GrowlModule

  ],
  providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: Interceptor,
        multi: true
      },
       
  ],
  declarations: [ ReviewComponent ]
})
export class ReviewModule { }
