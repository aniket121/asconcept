import { Injectable, } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { environment } from '../../environments/environment';
let headers = new Headers();
headers.append('authorization', localStorage.getItem("auth_token"));

@Injectable()
export class ProjectService {  

  constructor( private http: Http) { }

add(id,project) { 
        
           
             return this.http.post(environment.baseUrl+"addproject/"+id+"/", JSON.stringify(project),{ headers: headers })
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}

    rename(id,project) { 
        
           
             return this.http.post(environment.baseUrl+"renameproject/", JSON.stringify(project),{ headers: headers })
			.map((response: Response) => {	
			 					
				return response.json();			
			})
	}

      delete(project) { 
        
           
             return this.http.post(environment.baseUrl+"deleteproject/", JSON.stringify(project),{ headers: headers })
			.map((response: Response) => {	
		 						
				return response.json();			
			})
	}


    getAllprojects(id) { 
        
           
             return this.http.get(environment.baseUrl+"getproject/"+id+"/")
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}

 
	 

	  
}
