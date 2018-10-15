import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DropdownModule } from 'ng2-bootstrap/dropdown';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import {TranslateModule} from 'ng2-translate';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardService } from './dashboard.service';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {TranslateService, TranslateLoader, TranslateStaticLoader} from 'ng2-translate';
import { Http } from '@angular/http';
import { ModalModule } from 'ng2-bootstrap/modal';
export function httpFactory(http: Http) {
  return new TranslateStaticLoader(http, '/review/assets/i18n', '.json');
}

@NgModule({
  imports: [
  
    DashboardRoutingModule,
    ChartsModule,
    DropdownModule, BootstrapModalModule,HttpModule,CommonModule,FormsModule, ModalModule.forRoot(),
    TranslateModule.forRoot({ 
          provide: TranslateLoader,
          useFactory: httpFactory,
          deps: [Http]
        })
  ],
  declarations: [ DashboardComponent ],
   providers: [
        DashboardService
  ],
})
export class DashboardModule { }
