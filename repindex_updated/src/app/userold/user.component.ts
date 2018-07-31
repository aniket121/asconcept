 import { Component, Input, Output ,  OnInit , EventEmitter } from '@angular/core';

import { repindexService } from '../repindex.service';
 import { UserService } from './user.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'child-comp',
  templateUrl: './user.component.html',
  
})


export class UserComponent implements OnInit{
   

  projectData: any = {};
  projectName;

 constructor( private router: Router, private UserService: UserService,private activeRoute: ActivatedRoute) {
 this.router=router;
}

ngOnInit(): void { 
     
        this.activeRoute.queryParams.subscribe((params: Params) => {
        var that = this;       
        var  projectId = params['projectId'];
       
        localStorage.setItem('projectId',projectId );
          
        localStorage.setItem('projectName', params['project']);  
         localStorage.setItem('uristatus', params['uristatus']);  
           if( localStorage.getItem("counter")=="0"){
          this.hello();
          }
          
       localStorage["counter"] = "1";

    
        
 
      })  
      
  }

  hello(){
       location.reload();
  }

 goProject(){
   //  this.router.navigate(['/project']);
     this.router.navigate(['/project'],{ queryParams: { reProject:"1"} });
     setTimeout(function(){ window.location.reload(); }, 100);

 }
 
}