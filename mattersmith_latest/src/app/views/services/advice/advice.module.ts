import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { AdviceComponent } from './advice.component';
import { AdviceRoutingModule } from './advice-routing.module';
import {PasswordModule} from 'primeng/password';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';



@NgModule({
  imports: [
    AdviceRoutingModule,
    CommonModule    
    // ChartsModule
  ],
  
  declarations: [ AdviceComponent ]
})
export class AdviceModule { }


