
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';



@Injectable()
export class repindexService {
    url = "api/books";
    constructor(private http:Http) { }
   
    authenticationUser(userobject) {
	
    }
    
} 
