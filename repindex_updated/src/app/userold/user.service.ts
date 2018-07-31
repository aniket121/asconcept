import { Injectable, } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { environment } from '../../environments/environment';


@Injectable()
export class UserService {  

  constructor( private http: Http) { }
 
    getData(id) { 
        
           
             return this.http.get(environment.baseUrl+"getprojectDetails/"+id)
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}

 
   

 
	 

	  
}