import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { AppComponent} from '../../app.component';
import { DashboardComponent } from './home.component';
import { DashboardRoutingModule } from './home-routing.module';



import { Ng2FilterPipeModule } from 'ng2-filter-pipe';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { DataTableModule } from 'primeng/primeng'; // Here
import { PaginatorModule } from 'primeng/primeng'; // Here

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from '../../interceptor';

import { SliderModule } from 'angular-image-slider';

@NgModule({
  imports: [
    DashboardRoutingModule,
    ChartsModule,
    SliderModule,
    CommonModule,
    HttpClientModule,
    DataTableModule,
    FormsModule,
    Ng2SmartTableModule,
    Ng2FilterPipeModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: Interceptor,
    multi: true
  }],
  declarations: [ DashboardComponent ]
})
export class DashboardModule { }
