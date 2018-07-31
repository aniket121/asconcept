import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import {Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls:['app-header.component.scss']
})
export class AppHeaderComponent implements OnInit{ 
  username:string = '';
  role_type:string=''
 
  public show_home:boolean = true;
  public show_about_us:boolean = false;
 
  public home_content:string =''
  public about_content_1:string = '';
  public about_content_2:string = '';
  public all_routing:any = {};
  public line:boolean = false;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute) {

      this.role_type = Cookie.get("role_type");
      this.username = Cookie.get("username")
   }

   ngOnInit(){
     var url = this.activatedRoute.snapshot.url[0].path
     if( url == 'advice' ){
      this.line = false;
      this.home_content = 'Legal advice, accelerated by technology';
     }else if(url == 'nda-s'){
      this.line = true;
      this.home_content = 'Law matters. So does speed.'; 
     }else if(url == 'home'){
      this.line = false;
      this.home_content = 'Legal advice, accelerated by technology';     
     }else if(url == 'technology' ){
      this.line = true;
      this.home_content = 'Law matters. Technology helps.';
     }else if(url == 'about-us' ){
      this.line = true;
      this.home_content = 'Law matters. Technology helps.';
     }
     else if(url == 'contact-us' ){
      this.line = false;
      this.home_content = 'Legal advice, accelerated by technology';
     }
     else{
      this.line = false;
      this.home_content = '';
     }

   }
  
  logOut(){
     localStorage.clear();
     Cookie.deleteAll();
     window.location.href="/"
  }
}
