import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { TechnologyComponent } from './technology.component';
import { TechnologyRoutingModule } from './technology-routing.module';
import {PasswordModule} from 'primeng/password';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';



@NgModule({
  imports: [
    TechnologyRoutingModule,
    CommonModule    
    // ChartsModule
  ],
  
  declarations: [ TechnologyComponent ]
})
export class TechnologyModule { }


