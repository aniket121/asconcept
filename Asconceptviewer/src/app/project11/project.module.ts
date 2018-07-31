import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DropdownModule } from 'ng2-bootstrap/dropdown';

import { ProjectComponent } from './project.component';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectService } from './project.service';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  imports: [
    ProjectRoutingModule,
    ChartsModule,
    DropdownModule,HttpModule,CommonModule,FormsModule
  ],
  declarations: [ ProjectComponent ],
   providers: [
       ProjectService
  ],
})
export class projectModule { }
