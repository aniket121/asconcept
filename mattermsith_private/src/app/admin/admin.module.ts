import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { FormsModule } from '@angular/forms'
import {PasswordModule} from 'primeng/password';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from '../interceptor'
import { CommonModule } from '@angular/common';

import { DataTableModule, DropdownModule } from 'primeng/primeng'; // Here
import {GrowlModule} from 'primeng/growl';
import {DialogModule} from 'primeng/dialog';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { AdminService } from './admin.service';
import {TooltipModule} from 'primeng/tooltip';

@NgModule({
  imports: [
    AdminRoutingModule,
    FormsModule,
    DataTableModule,
    DropdownModule,
    GrowlModule,
    DialogModule,
    TooltipModule,
    PasswordModule,
    MultiselectDropdownModule,
    HttpClientModule,
    CommonModule    
    // ChartsModule
  ],
  providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: Interceptor,
        multi: true
      },
      AdminService      
  ],
  declarations: [ AdminComponent ]
})
export class AdminModule { }
