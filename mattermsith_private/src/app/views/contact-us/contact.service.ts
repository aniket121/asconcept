import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import {CanActivate} from "@angular/router";
@Injectable()
export class UserService {
    constructor(private http: HttpClient) {      
    }
   
    Users() {
        return this.http.get(environment.BASE_URL + '/users/').map(res => res);
    }
    canActivate()
    {
       return true;
    }
}