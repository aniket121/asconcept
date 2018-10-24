import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { CustomerComponent } from './about.component';
import { CustomerRoutingModule } from './about-routing.module';
import { FormsModule } from '@angular/forms'
//import { DialogModule } from '../dialog/dialog.module';
import { DataTableModule } from 'primeng/primeng'; // Here
import { TabsModule } from 'ngx-bootstrap/tabs';
import {DialogModule} from 'primeng/dialog';
import {CalendarModule} from 'primeng/primeng';
import {CommonModule} from '@angular/common';
import { InternationalPhoneModule } from 'ng4-intl-phone';
@NgModule({
  imports: [
    CustomerRoutingModule,
    FormsModule,
    DialogModule,
    InternationalPhoneModule,
    TabsModule,
    InternationalPhoneModule,
    CommonModule,
    CalendarModule,
    DataTableModule,
    // ChartsModule
  ],
  declarations: [ CustomerComponent ]
})
export class CustomerModule { }
