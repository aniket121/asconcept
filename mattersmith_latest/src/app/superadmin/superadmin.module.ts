import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { SuperadminComponent } from './superadmin.component';
import { SuperAdminRoutingModule } from './superadmin-routing.module';
import { FormsModule } from '@angular/forms'
import {PasswordModule} from 'primeng/password';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from '../interceptor'
import { CommonModule } from '@angular/common';

import { DataTableModule, DropdownModule } from 'primeng/primeng'; // Here
import {GrowlModule} from 'primeng/growl';
import {DialogModule} from 'primeng/dialog';
import {MessageService} from 'primeng/components/common/messageservice';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { UserService } from './superadmin.service';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {TooltipModule} from 'primeng/tooltip';
import {ButtonModule} from 'primeng/button';

@NgModule({
  imports: [
    SuperAdminRoutingModule,
    FormsModule,
    ButtonModule,
    TooltipModule,
    DataTableModule,
    ToggleButtonModule,
    DropdownModule,
    GrowlModule,
    DialogModule,
    PasswordModule,
    HttpClientModule,
    MultiselectDropdownModule,
    CommonModule    
    // ChartsModule
  ],
  providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: Interceptor,
        multi: true
      },
      UserService      
  ],
  declarations: [ SuperadminComponent ]
})
export class SuperAdminModule { }
