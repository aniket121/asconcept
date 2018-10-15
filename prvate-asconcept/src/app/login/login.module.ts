import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DropdownModule } from 'ng2-bootstrap/dropdown';
import { CommonModule } from '@angular/common';  
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { repindexService } from '../repindex.service';
import { LoginService } from './login.service';
import { HttpModule } from '@angular/http';
import { ModalModule } from 'ng2-bootstrap/modal';

@NgModule({
  imports: [
    LoginRoutingModule,
    ChartsModule,
    ModalModule.forRoot(),
    DropdownModule,CommonModule,HttpModule
  ],
  declarations: [ LoginComponent ],
   providers: [
        repindexService,LoginService
  ],
})
export class LoginModule { }
