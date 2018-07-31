import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DropdownModule } from 'ng2-bootstrap/dropdown';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { chartsComponent } from './charts.component';
import { chartsRoutingModule } from './charts-routing.module';
import { chartsService } from './charts.service';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
 
import { ModalModule } from 'ng2-bootstrap/modal';

@NgModule({
  imports: [
  
    chartsRoutingModule,
    ChartsModule,
    DropdownModule, BootstrapModalModule,HttpModule,CommonModule,FormsModule, ModalModule.forRoot(),
  
  ],
  declarations: [ chartsComponent ],
   providers: [
        chartsService
  ],
})
export class chartsModule { }
