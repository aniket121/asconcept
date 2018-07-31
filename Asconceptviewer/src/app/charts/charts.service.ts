import { Injectable, } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { environment } from '../../environments/environment';


@Injectable()
export class chartsService {

  constructor( private http: Http) { }

   add(user,id) { 
        let headers = new Headers();
		 return this.http.post(environment.baseUrl+"Register/"+id+"/", JSON.stringify(user))
			.map((response: Response) => {								
				return response.json();			
			})
	}

	

}
