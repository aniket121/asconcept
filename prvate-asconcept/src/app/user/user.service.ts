import { Injectable, } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { environment } from '../../environments/environment';
let headers = new Headers();
headers.append('authorization', localStorage.getItem("auth_token"));

@Injectable()
export class UserService {  

  constructor( private http: Http) { }
 
    getData(id) { 
        
           
             return this.http.get(environment.baseUrl+"getprojectDetails/"+id)
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}
	gettextlist(pid) { 
        
           
             return this.http.get(environment.baseUrl+"getalltextlist/"+pid)
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}
	concurdanceSearch(obj,pid) { 
        
           
             return this.http.post(environment.baseUrl+"concordanceline/"+pid,JSON.stringify(obj))
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}
	clusterSearch(obj,pid,uid) { 
        
           
             return this.http.post(environment.baseUrl+"clusterquery/"+pid+"/"+uid+"/",JSON.stringify(obj))
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}
	getconcept(pid) { 
        
           
             return this.http.get(environment.baseUrl+"getconceptlist/"+pid)
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}
    selfconcordancesearch(obj,pid,uid)
    {
            return this.http.post(environment.baseUrl+"selfcordoncordance/"+pid+"/"+uid+"/",JSON.stringify(obj))
			.map((response: Response) => {	
				 						
				return response.json();			
			})


    }
	  frequencycount(obj)
    {
            return this.http.post(environment.baseUrl+"frequencycount/",JSON.stringify(obj))
			.map((response: Response) => {	
				 						
				return response.json();			
			})


    }
	getstoplist()
    {
            return this.http.get(environment.baseUrl+"stoplistdata/")
			.map((response: Response) => {	
				 						
				return response.json();			
			})


    }
     deleteMultipleTextfile(stringobj)
    {
            return this.http.post(environment.baseUrl+"delete-multiple/",JSON.stringify(stringobj))
			.map((response: Response) => {	
				 						
				return response.json();			
			})


    }
    getRange(obj)
    {
            return this.http.post(environment.baseUrl+"get-value/",JSON.stringify(obj))
			.map((response: Response) => {	
				 						
				return response.json();			
			})


    }
    getDocumentUrl(pid){
			return this.http.get(environment.baseUrl+ "get-urls/" + pid)
			.map((response: Response) => {	
					return response.json();			
			})
		}
	dataComparision(data){           
             return this.http.post(environment.baseUrl+"document-comparison/",JSON.stringify(data))
				.map((response: Response) => {												
					return response.json();			
				})
		}
	getAvailableUrlsData(data){		
		return this.http.post(environment.baseUrl+"get-url-data/",JSON.stringify(data))
		.map((response: Response) => {	
			return response.json();			
		})
	}

	getAvailableData(data){
		return this.http.post(environment.baseUrl+"get-document-data/",JSON.stringify(data))
		.map((response: Response) => {	
			return response.json();			
		})
	}
        getKnowledgeNode(){
	  return this.http.get("https://mattersmith1.embeddedexperience.com/api/graph")
		.map((response: Response) => {	
			return response.json();			
		})
        }






   

 
	 

	  
}
