import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import 'rxjs/add/operator/map';
import { CanActivate } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
@Injectable()
export class AppService implements CanActivate {
    public activeToken: String;

    constructor(private http: HttpClient) {
        
    }
   
    
    canActivate() {
       var userType=Cookie.get("user")
       
       if(userType=="superuser"){
       return true;
       }else
       {
       return false;

       }

    }
}