import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DropdownModule } from 'ng2-bootstrap/dropdown';
import { UserService } from './user.service';
import { UserComponent } from './user.component';
import { UserRoutingModule } from './user-routing.module';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
/*import { repindexService } from '../repindex.service';*/
@NgModule({
  imports: [
    UserRoutingModule,
    ChartsModule,
    DropdownModule, DropdownModule,HttpModule,CommonModule,FormsModule
  ],
  declarations: [ UserComponent ],
   providers: [
        UserService
  ],
})
export class userModule { }
