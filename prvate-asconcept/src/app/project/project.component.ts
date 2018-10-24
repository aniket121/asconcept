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
  localStorage.setItem("addproject","afterproject" );  
  localStorage.setItem("lang","en");
 
}

  ngOnInit(): void {
     
      window.history.forward()
      var userType=localStorage.getItem('usertype')
       if(userType=="user"){
        
       }
       else{
        
        window.location.href="/review/#/login"
       }
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
      //localStorage.setItem("addproject","beforeproject" );  
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
 public resultStatus:any = '';
 addproject(){
    this.newproject.project_name= (<HTMLInputElement>document.getElementById("project-name")).value;
    this.successStatus = false;
    var id = localStorage.getItem('userId'); 
    if(this.newproject.project_name.length>2){
      this.ProjectService.add(id,this.newproject).subscribe(data => {
            this.successStatus = true;
            this.resultStatus = "Project created successfully."
              location.reload();
      });
    }else{
      this.successStatus = false;
      this.resultStatus = "Please Enter Valid project name";
    }
    
 }

 editproject(pid,pname){
    this.resultStatus = '';
    this.successStatus = false;
    (<HTMLInputElement>document.getElementById("project-id")).value = pid;
    (<HTMLInputElement>document.getElementById("newname")).value = pname;
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
        if(this.renameproject.project_name.length >= 1){
              this.ProjectService.rename(projectId,this.renameproject).subscribe(data => {
                this.successStatus = true;
                this.resultStatus = "Project edited successfully.";
                 location.reload();
              });
        }else{
          this.successStatus = false;
          this.resultStatus = "Please Enter Valid project name";         
        }
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
var uid=localStorage.getItem('userId');
localStorage.setItem("userId",uid ); 
localStorage.setItem("projectId",pid ); 
 localStorage.setItem('projectName', pname);
 localStorage.setItem("addproject","afterproject" );  


 //window.location.href='https://46.235.224.150/review/#/user?projectId='+ pid +'&project='+ pname + '&uristatus=ok';
 this.router.navigate(['/user'],{ queryParams: { projectId:pid,project:pname,uristatus:"ok"}})
 
 localStorage.setItem("addproject","afterproject" );  
 localStorage.setItem("projectId",pid ); 
 localStorage.setItem('projectName', pname);
 //setTimeout(function(){ window.location.reload();console.log("redirect to user") }, 2000);
 }
} 
