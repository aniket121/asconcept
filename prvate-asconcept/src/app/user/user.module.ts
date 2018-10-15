import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DropdownModule } from 'ng2-bootstrap/dropdown';
import { UserService } from './user.service';
import { UserComponent } from './user.component';
import { UserRoutingModule } from './user-routing.module';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';  
import { Http } from '@angular/http';
import {TranslateService, TranslateLoader, TranslateStaticLoader} from 'ng2-translate';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ng2-bootstrap/modal';
import {TranslateModule} from 'ng2-translate';
/*import { repindexService } from '../repindex.service';*/
export function httpFactory(http: Http) {
  return new TranslateStaticLoader(http, '/review/assets/i18n', '.json');
}
@NgModule({
  imports: [
    UserRoutingModule,
    ChartsModule,
     ModalModule.forRoot(),
    DropdownModule, DropdownModule,HttpModule,CommonModule,FormsModule,
    TranslateModule.forRoot({ 
          provide: TranslateLoader,
          useFactory: httpFactory,
          deps: [Http]
        })
  ],
  declarations: [ UserComponent ],
   providers: [
        UserService
  ],
})
export class userModule { }
