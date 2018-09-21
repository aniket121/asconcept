import { Injectable, } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { environment } from '../../environments/environment';
let headers = new Headers();
headers.append('authorization', localStorage.getItem("auth_token"));


@Injectable()
export class superDashboardService {

  constructor( private http: Http) { }

   add(user) { 

             return this.http.post(environment.baseUrl+"adminregsiter/", JSON.stringify(user),{headers:headers})
			.map((response: Response) => {								
				return response.json();			
			})
	}

	EditClient(id,user) { 

             return this.http.post(environment.baseUrl+"updatesuperuser/"+id+"/", JSON.stringify(user))
			.map((response: Response) => {								
				return response.json();			
			})
	}

		DeleteClient(user) { 
             console.log("id of delete user",user)
             return this.http.post(environment.baseUrl+"deleteUser/", JSON.stringify(user),{headers:headers})
			.map((response: Response) => {	
				console.log("in respobse");							
				return response.json();			
			})
	}

	  getAllCategories() { 	
             return this.http.get(environment.baseUrl+"getAlladmin/",{headers:headers})
			.map((response: Response) => {								
				return response.json();			
			})
	}

	  getClientById(id) { 
        let headers = new Headers();
		//headers.append('Content-Type', 'application/json');
		//headers.append('Access-Control-Allow-Origin', '*');
        
		//let options = new RequestOptions({ headers: headers });

             return this.http.get(environment.baseUrl+"getuserbyid/"+id+"/")
			.map((response: Response) => {								
				return response.json();			
			})
	}

	ActiveClient(id){
		 let headers = new Headers();
		//headers.append('Content-Type', 'application/json');
		//headers.append('Access-Control-Allow-Origin', '*');
        
		//let options = new RequestOptions({ headers: headers });

             return this.http.get(environment.baseUrl+"activateUser/"+id+"/")
			.map((response: Response) => {								
				return response.json();			
			})

	}
		DeactiveClient(id){
		 let headers = new Headers();
		//headers.append('Content-Type', 'application/json');
		//headers.append('Access-Control-Allow-Origin', '*');
        
		//let options = new RequestOptions({ headers: headers });

             return this.http.get(environment.baseUrl+"inactiveUser/"+id+"/")
			.map((response: Response) => {								
				return response.json();			
			})

	}
       changeConceptStatus(id){
	   
		 let headers = new Headers();
         return this.http.get(environment.baseUrl+"concept-status/"+id+"/")
		 .map((response: Response) => {								
				return response.json();			
		  })
	}


   changeStopListStatus(id){
	   
		 let headers = new Headers();
         return this.http.get(environment.baseUrl+"stoplist-status/"+id+"/")
		 .map((response: Response) => {								
				return response.json();			
		  })
	}
     adduserManual(obj){
	let formData:FormData = new FormData();
	formData.append('user_manual',obj);
	let headers = new Headers();
	headers.append('Content-Type', 'multipart/form-data');
	headers.append('Accept', 'application/json');
	let options = new RequestOptions({ headers: headers });	 

	return this.http.post(environment.baseUrl+"user-manual/", formData)
	.map((response: Response) => {	
								
		return response.json();			
	})
 }

}
