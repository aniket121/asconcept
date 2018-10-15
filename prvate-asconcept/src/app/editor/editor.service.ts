import { Injectable, } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { environment } from '../../environments/environment';


@Injectable()
export class editorService {  

  constructor( private http: Http) { }
 
   
	
	
	getfileconten(fid) { 
        
           
             return this.http.get(environment.baseUrl+"getfilecontes/"+fid+"/")
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}
        saveDocumentData(obj) { 
        
           
             return this.http.post(environment.baseUrl+"savedocumentdata/",JSON.stringify(obj))
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}
    


   

 
	 

	  
}
