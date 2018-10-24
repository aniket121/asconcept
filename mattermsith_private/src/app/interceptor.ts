import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/catch';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable()
export class Interceptor implements HttpInterceptor {
    constructor() { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        console.log("intercepted request ... ");

        // Clone the request to add the new header.
        var token = Cookie.get('auth_token');
        console.log(Cookie.getAll())
        if(Cookie.get('url') == 'login'){
            Cookie.set("url",'')
            const authReq = req.clone({ headers: req.headers.set("Authorization",'Login P1R2A3V4N5')});
                return next.handle(authReq).catch((error, caught) => {
                    return Observable.throw(error);
                }) as any;

        } else {
            const authReq = req.clone({ headers: req.headers.set("Authorization",token)});
                return next.handle(authReq).catch((error, caught) => {
                    return Observable.throw(error);
                }) as any;

        }     
    }
}