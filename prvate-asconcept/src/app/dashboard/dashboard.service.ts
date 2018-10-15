import { Injectable, } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { environment } from '../../environments/environment';


@Injectable()
export class DashboardService {

  constructor( private http: Http) { }

   add(user,id) { 
        let headers = new Headers();
		//headers.append('Content-Type', 'application/json');
		//headers.append('Access-Control-Allow-Origin', '*');
        
		//let options = new RequestOptions({ headers: headers });

             return this.http.post(environment.baseUrl+"Register/"+id+"/", JSON.stringify(user))
			.map((response: Response) => {								
				return response.json();			
			})
	}

	EditClient(id,user) { 
        let headers = new Headers();
		//headers.append('Content-Type', 'application/json');
		//headers.append('Access-Control-Allow-Origin', '*');
        
		//let options = new RequestOptions({ headers: headers });

             return this.http.post(environment.baseUrl+"updateClientInfo/"+id+"/", JSON.stringify(user))
			.map((response: Response) => {								
				return response.json();			
			})
	}

		DeleteClient(user) { 
        //let headers = new Headers();
		//headers.append('Content-Type', 'application/json');
		//headers.append('Access-Control-Allow-Origin', '*');
        
		//let options = new RequestOptions({ headers: headers });
             console.log("id of delete user",user)
             return this.http.post(environment.baseUrl+"deleteUser/", JSON.stringify(user))
			.map((response: Response) => {	
				console.log("in respobse");							
				return response.json();			
			})
	}

	  getAllCategories(id) { 
        let headers = new Headers();
		//headers.append('Content-Type', 'application/json');
		//headers.append('Access-Control-Allow-Origin', '*');
        
		//let options = new RequestOptions({ headers: headers });

             return this.http.get(environment.baseUrl+"getallclient/"+id+"/")
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

}