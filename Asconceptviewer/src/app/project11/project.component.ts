import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { repindexService } from '../repindex.service';

import { ProjectService } from './project.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
declare var $: any;
var that;
@Component({
  templateUrl: './project.component.html'
})


export class ProjectComponent implements OnInit{
  newproject: any = {};
   renameproject: any = {};
    deleteproject: any = {};
   successStatus:boolean=false;
   renameStatus:boolean=false;
   deleteStatus:boolean=false;
     public categories: any = [];
     public userTable: any;
      public showTable: boolean = false;
   public categoryTable: any;
     public statuspage;


 constructor( private activeRoute: ActivatedRoute,private router: Router,private ProjectService: ProjectService,private cdrf: ChangeDetectorRef) {
 this.router=router;
  localStorage.setItem("addproject","beforeproject" ); 
  localStorage.setItem("lang","en");
 
}

  ngOnInit(): void {

            
  
      
    
      window.history.forward()

    
     //alert(window.location.href)
     var access=window.location.href.split("/");

     if (access.includes('access_token')){

      var len = access.length;
      var access_token = access[len-1];
       localStorage.setItem("access_token",access_token );
     }
     else
     {
     localStorage.setItem("access_token","undefined" );
     }
     
    
        
      



      localStorage.setItem("addproject","beforeproject" );  
      this. getAllprojects().then((data) => {
     });
  
            if( localStorage.getItem("counter")=="0"){
          this.hello();
          }
          
       localStorage["counter"] = "1";




  }

  

    hello(){
       setTimeout(function(){ window.location.reload(); }, 50);


  }

   getAllprojects() {
         var id = localStorage.getItem('userId');
        
    return new Promise((resolve, reject) => {
      this.categories = [];
      if (this.categoryTable) {
        this.categoryTable.destroy();
      }
      this.ProjectService.getAllprojects(id).subscribe(data => {
        this.categories = data;
       console.log(this.categories);
        this.showTable = true;
        this.cdrf.detectChanges();
        this.categoryTable = $('#categoryTable').DataTable({
          responsive: false,
          "pagingType": "full_numbers",
        });
        this.cdrf.detectChanges();
         resolve(data.result);
      })
    })
    
  }


 changestroage()
 {
   localStorage.setItem('userrole', 'user');
   this.router.navigate(['/user']);
   setTimeout(function(){ window.location.reload(); }, 1000);
 }

 addproject(){
  

   
    
    this.newproject.project_name= (<HTMLInputElement>document.getElementById("project-name")).value;
   
    var id = localStorage.getItem('userId'); 
    this.ProjectService.add(id,this.newproject).subscribe(data => {
 
          
          this.successStatus = true;
           setTimeout(function(){ 

             location.reload();
           },1000);
          
       
        });
     
    
 }

 editproject(pid){
    (<HTMLInputElement>document.getElementById("project-id")).value = pid;
     document.getElementById("hiddenRename").click();

 }
  
 deleteProject(pid){
   var pid =  (<HTMLInputElement>document.getElementById("project-id")).value = pid;
 (<HTMLInputElement>document.getElementById("deleteprojectid")).value=pid;
  
   document.getElementById("hiddenDelete").click();
   
 }

 rename(){
       
       var  projectId = (<HTMLInputElement>document.getElementById("project-id")).value;
        var projectName = (<HTMLInputElement>document.getElementById("newname")).value;
       this.renameproject.project_id = projectId;
        this.renameproject.project_name = projectName;

         this.ProjectService.rename(projectId,this.renameproject).subscribe(data => {
 
           this.renameStatus = true;
              setTimeout(function(){ 

             location.reload();
           },1000);
      });
       
 }

 delete(){  


       var proId =  (<HTMLInputElement>document.getElementById("deleteprojectid")).value;
       this.deleteproject.project_id=proId;

         this.ProjectService.delete(this.deleteproject).subscribe(data => {
           this.deleteStatus  =true;
         
               setTimeout(function(){ 

             location.reload();
           },1000);
      });

 }

 goTo(pid,pname)
{   
var url = 'http://localhost:4200/#/user?projectId='+ pid +'&project='+ pname + '&uristatus=ok';
 window.location.replace( url ) 
 
 localStorage.removeItem('addproject'); 
 localStorage.setItem("addproject","afterproject" ); 
 localStorage.setItem('projectName', pname);
 window.location.reload(); 
 }
} 