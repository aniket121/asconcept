import { Injectable, } from '@angular/core';
import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { environment } from '../../environments/environment';
let headers = new Headers();
headers.append('authorization', localStorage.getItem("auth_token"));

@Injectable()
export class LayoutService {  

  constructor( private http: Http) { }
 
    getData(id) { 
        
           
             return this.http.get(environment.baseUrl+"getprojectDetails/"+id)
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}

	addFolder(folder,uid,pid) { 
        

            
             return this.http.post(environment.baseUrl+"addFolder/"+pid+"/"+uid+"/",JSON.stringify(folder))
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}

	renameFolder(id,obj) {  
        

            
             return this.http.post(environment.baseUrl+"renameFolder/"+id+"/",JSON.stringify(obj))
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}

		deleteFolder(id,obj) {  
        

            
             return this.http.post(environment.baseUrl+"deleteFolder/"+id+"/",JSON.stringify(obj))
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}

    addNewTextList(uid,pid,fid,access_token,obj){
		     let formData:FormData = new FormData();
			  for(var i in obj){
				  formData.append('text_file'+i,obj[i]);
			  }
			  console.log("--------------------")
			  console.log(obj)
			  console.log("--------------------")		

			//  console.log(obj)
			// 	for(var i in obj){
			// 		console.log(obj[i])
			// 	}
			//  formData.append('text_file'+i,obj[i]);
			 let headers = new Headers();
		     headers.append('Content-Type', 'multipart/form-data');
             headers.append('Accept', 'application/json');
		     let options = new RequestOptions({ headers: headers });

				console.log(formData);

		return this.http.post(environment.baseUrl+"Savetextlist/"+pid+"/"+uid+"/"+fid+"/"+access_token+"/", formData)
			.map((response: Response) => {	
				 						
				return response.json();			
			})

	}

	  addNewConceptList(folder_id:any,obj){
		     let formData:FormData = new FormData();
			 formData.append('browse_concept_list',obj);
			 let headers = new Headers();
		     headers.append('Content-Type', 'multipart/form-data');
             headers.append('Accept', 'application/json');
		     let options = new RequestOptions({ headers: headers });

		 

		return this.http.post(environment.baseUrl+"saveConceptlist/"+localStorage.getItem('projectId')+"/"+localStorage.getItem('userId')+"/" + folder_id +"/", formData)
			.map((response: Response) => {	
				 						
				return response.json();			
			})

	}

 addNewStopList(obj){
	let formData:FormData = new FormData();
	formData.append('browse_stop_list',obj);
	let headers = new Headers();
	headers.append('Content-Type', 'multipart/form-data');
	headers.append('Accept', 'application/json');
	let options = new RequestOptions({ headers: headers });	 

	return this.http.post(environment.baseUrl+"import-stop-list/", formData)
	.map((response: Response) => {	
								
		return response.json();			
	})
}

deleteConceptList(obj){
	return this.http.post(environment.baseUrl+"deleteconcept/",JSON.stringify(obj))
			.map((response: Response) => {	
				return response.json();			
	})
}

deleteStopList(obj){
	return this.http.post(environment.baseUrl+"delete-stoplist/"+ obj + "/",JSON.stringify(obj))
			.map((response: Response) => {	
				return response.json();			
	})
}

	  renameConceptList(obj){
		return this.http.post(environment.baseUrl+"renameconcept/",JSON.stringify(obj))
			.map((response: Response) => {	
				return response.json();			
			})
	}

	  renameStopList(obj){
		return this.http.post(environment.baseUrl+"rename-stoplist/",JSON.stringify(obj))
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
    addDefination(obj){
		return this.http.post(environment.baseUrl+"addDefination/",JSON.stringify(obj))
			.map((response: Response) => {	
				return response.json();			
			})
	}
	getDefination(id:any){
		return this.http.get(environment.baseUrl+"getDefination/"+id+"/")
			.map((response: Response) => {	
				return response.json();			
			})
	}
	deleteTextList(obj){

	return this.http.post(environment.baseUrl+"delete-text-list/"+ obj.id + "/",JSON.stringify(obj))
			.map((response: Response) => {	
				return response.json();			
	})
}

     
	 getConceptlist(pid:any)
    {
            return this.http.get(environment.baseUrl+"getconceptlist/"+pid+"/")
			.map((response: Response) => {	
				 						
				return response.json();			
			})


    }
    deleteMultipleConceptList(obj){
	return this.http.post(environment.baseUrl+"delete-multiple-concept/",JSON.stringify(obj))
			.map((response: Response) => {	
				return response.json();			
	})
}
addsubFolder(uid,pid,obj) { 
        

            
             return this.http.post(environment.baseUrl+"addsubFolder/"+uid+"/"+pid+"/",JSON.stringify(obj))
			.map((response: Response) => {	
				 						
				return response.json();			
			})
	}
	addConceptFolder(folder,uid,pid) { 
             return this.http.post(environment.baseUrl+"create-folder/"+pid+"/"+uid+"/",JSON.stringify(folder))
			.map((response: Response) => {	
				return response.json();			
			})
	}
	 getConceptFolder(pid){
            return this.http.get(environment.baseUrl+"get-concept-folder/"+pid)
			.map((response: Response) => {						
				return response.json();			
			})
    }
    deleteConceptFolder(id) { 
		return this.http.post(environment.baseUrl+"delete-concept-folder/"+id.id+"/",JSON.stringify(id))
		.map((response: Response) => {	
				return response.json();			
		})
	}
	renameFolderConcept(id,obj) {  
             return this.http.post(environment.baseUrl+"rename-concept-folder/"+id+"/",JSON.stringify(obj))
			.map((response: Response) => {	
				return response.json();			
			})
	}
	addUrl(pid,obj) { 
		return this.http.post(environment.baseUrl+"add-url/"+pid+"/",JSON.stringify(obj))
		.map((response: Response) => {
			return response.json();			
		})
}
deleteURL(obj){
	return this.http.post(environment.baseUrl+"delete-url/"+ obj.id + "/",JSON.stringify(obj))
			.map((response: Response) => {	
				return response.json();			
	})
}
addNewMasterList(obj){
	let formData:FormData = new FormData();
	formData.append('text_file',obj);
	let headers = new Headers();
	headers.append('Content-Type', 'multipart/form-data');
	headers.append('Accept', 'application/json');
	let options = new RequestOptions({ headers: headers });	 
	return this.http.post(environment.baseUrl+"import-master-list/"+  localStorage.getItem('userId') + "/", formData)
	.map((response: Response) => {									
		return response.json();			
	})
}

getmasterlist(){
	return this.http.get(environment.baseUrl+"get-master-list/")
	.map((response: Response) => {
			return response.json();			
	})
}

deleteMasterList(obj:any){
	return this.http.get(environment.baseUrl+"delete-master-list/"+ obj)
			.map((response: Response) => {	
				return response.json();			
	})
}

renameMasterList(obj){
	return this.http.post(environment.baseUrl+"rename-master-list/",JSON.stringify(obj))
	.map((response: Response) => {	
		return response.json();			
	})
}
getKnowledgeNode(){
	  return this.http.get("https://46.235.224.150/api/graph")
		.map((response: Response) => {	
			return response.json();			
		})
}

	  
}
