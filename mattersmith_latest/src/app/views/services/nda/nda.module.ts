import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { NdaComponent } from './nda.component';
import { NdaRoutingModule } from './nda-routing.module';
import {PasswordModule} from 'primeng/password';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';



@NgModule({
  imports: [
    NdaRoutingModule,
    CommonModule    
    // ChartsModule
  ],
  
  declarations: [ NdaComponent ]
})
export class NdaModule { }


