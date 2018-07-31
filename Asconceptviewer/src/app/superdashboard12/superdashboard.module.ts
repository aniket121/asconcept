import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DropdownModule } from 'ng2-bootstrap/dropdown';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { superDashboardComponent } from './superdashboard.component';
import { superDashboardRoutingModule } from './superdashboard-routing.module';
import { superDashboardService } from './superdashboard.service';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
 
import { ModalModule } from 'ng2-bootstrap/modal';

@NgModule({
  imports: [
  
    superDashboardRoutingModule,
    ChartsModule,
    DropdownModule, BootstrapModalModule,HttpModule,CommonModule,FormsModule, ModalModule.forRoot(),
  
  ],
  declarations: [ superDashboardComponent ],
   providers: [
        superDashboardService
  ],
})
export class superDashboardModule { }
