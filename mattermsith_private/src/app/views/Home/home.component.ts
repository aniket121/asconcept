import { Component,ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent} from '../../app.component';
import { HttpClient } from "@angular/common/http";
import { DataTable, DataTableResource } from '../data-table';
import { Ng2SmartTableModule } from 'ng2-smart-table';


@Component({
  templateUrl: 'home.component.html',
  styleUrls:['home.component.scss']
})
export class DashboardComponent {


  constructor(private httpClient: HttpClient ) {  }
    ngOnInit() {  }
  

    


}
