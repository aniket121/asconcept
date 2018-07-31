import { NgModule } from '@angular/core';

import { UserComponent } from './contact.component';
import { UserRoutingModule } from './contact-routing.module';
import { FormsModule } from '@angular/forms'

import { UserService } from './contact.service';

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
    UserRoutingModule,
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
      UserService,
      MessageService      
  ],
  declarations: [ UserComponent ]
})
export class UserModule { }
