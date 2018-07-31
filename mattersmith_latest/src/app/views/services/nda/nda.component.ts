import { Component,ViewChild, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent} from '../../../app.component';
import { HttpClient } from "@angular/common/http";
import { DataTable, DataTableResource } from '../../data-table';
import { Ng2SmartTableModule } from 'ng2-smart-table';


@Component({
  templateUrl: 'nda.component.html',
  styleUrls:['nda.component.scss']
})
export class NdaComponent implements OnInit {
  public imagesUrl;
  

  constructor(private httpClient: HttpClient ) {}
    ngOnInit() {}
}
