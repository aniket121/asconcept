import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { FormsModule } from '@angular/forms'
import {PasswordModule} from 'primeng/password';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from '../interceptor'
import { CommonModule } from '@angular/common';


import { LoginService } from './login.service';

@NgModule({
  imports: [
    LoginRoutingModule,
    FormsModule,
    PasswordModule,
    HttpClientModule,
    CommonModule    
    // ChartsModule
  ],
  providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: Interceptor,
        multi: true
      },
      LoginService      
  ],
  declarations: [ LoginComponent ]
})
export class LoginModule { }
