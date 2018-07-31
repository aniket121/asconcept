import { Injectable, } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { environment } from '../../environments/environment';


@Injectable()
export class LoginService {

  constructor( private http: Http) { }

   login(user) { 
        let headers = new Headers();
		//headers.append('Content-Type', 'application/json');
		//headers.append('Access-Control-Allow-Origin', '*');
        
		//let options = new RequestOptions({ headers: headers });

             return this.http.post(environment.baseUrl+"login/", JSON.stringify(user))
			.map((response: Response) => {								
				return response.json();			
			})
	}
	ValidateEmail(email) { 
        
           
             return this.http.post(environment.baseUrl+"forgotpassword/", JSON.stringify(email))
			.map((response: Response) => {	
			 					
				return response.json();			
			})
	}
	changepassword(password,token) { 
        
           
             return this.http.post(environment.baseUrl+"changepassword/"+token+"/", JSON.stringify(password))
			.map((response: Response) => {	
			 					
				return response.json();			
			})
	}


}