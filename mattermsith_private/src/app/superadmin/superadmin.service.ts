import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import 'rxjs/add/operator/map';
import { environment } from './../../environments/environment';
export interface UserResponse {
   user:string,
   data:string,
   org:any,
   res:any
}
@Injectable()
export class UserService {
    public activeToken: String;
    public data:any
    constructor(private http: HttpClient) {        
    }

    getUsers(id) {
        return this.http.get<UserResponse>(environment.BASE_URL + '/user/'+id+'/').map(res => res);
    }
    addUser(data: any) {
        return this.http.post<UserResponse>(environment.BASE_URL + '/user/', data).map(res => res);
    }
    updateUser(data:any) {
        return this.http.put<UserResponse>(environment.BASE_URL + '/user/'+data.id+'/',data,{}).map(res => res);
    }    
    deleteUser(id:any) {
        return this.http.delete<UserResponse>(environment.BASE_URL + '/user/'+id+'/').map(res => res);
    }
    changeUserStatus(id:any) {
        return this.http.put<UserResponse>(environment.BASE_URL + '/user-status/'+id+'/',{}).map(res => res);
    }
    addOrganisation(data:any) {
        return this.http.post<UserResponse>(environment.BASE_URL + '/organisation/',data).map(res => res);
    }
    getOrganisation() {
        return this.http.get<UserResponse>(environment.BASE_URL + '/organisation/').map(res => res);
    }
    deleteOrganisation(id:any) {
        return this.http.delete<UserResponse>(environment.BASE_URL + '/organisation/'+id+'/').map(res => res);
    }
    
    
}