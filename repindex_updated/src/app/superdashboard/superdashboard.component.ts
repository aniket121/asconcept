import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { superDashboardService } from './superdashboard.service';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Observable, Subject } from 'rxjs/Rx';
import { ModalDirective } from 'ng2-bootstrap/modal/modal.component';
import * as _ from "lodash";
declare var $: any;
var that;
@Component({
  templateUrl: 'superdashboard.component.html'
  
})
export class superDashboardComponent implements OnInit {
    public categories: any = [];
     public userTable: any;
      public showTable: boolean = false;
   public categoryTable: any;
 clientdata: any = {};
  deleteUser: any = {};

  successStatus:boolean=false;
  failStatus:boolean=false;
  EditsuccessStatus:boolean=false;
  EditfailStatus:boolean=false;
    DeleteStatus:boolean=false;

 
 username;
 usernameStatus:boolean=true;
  password;
 passwordStatus:boolean=true;
 email;
 emailStatus:boolean=true;
 firstname;
 firstnameStatus:boolean=true;
  lastname;
 lastnameStatus:boolean=true;
  mobile;
 mobileStatus:boolean=true;
public model: any = {};
public model2: any = {};
public updateData: any = {};
 clients;

 private usernameStatusError :boolean=false;
 private passwordStatusError :boolean=false;
 private emailStatusError :boolean=false;
  private firstnameStatusError :boolean=false;
   private lastnameStatusError :boolean=false;
   private mobileStatusError :boolean=false;

 private validationStatus :boolean=false;

 
  
   constructor( private router: Router,private DashboardService: superDashboardService, private http: Http, private cdrf: ChangeDetectorRef) {
 this.router=router;
  that = this;
 }

  



  ngOnInit(): void {
      $( "#datepicker" ).datepicker();  
      this.getAllCategories().then((data) => {
     });
 
  }


    getAllCategories() {
    return new Promise((resolve, reject) => {
      this.categories = [];
      if (this.categoryTable) {
        this.categoryTable.destroy();
      }
      this.DashboardService.getAllCategories().subscribe(data => {
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

 


  addclient(model)
{
     console.log("in add client");
     model.usertype = 1;
    // var date = $("#datepicker").datepicker("getDate");
     //var dob = $.datepicker.formatDate("yy-mm-dd", date);
     //model.dob = dob;
     console.log(model)
     this.DashboardService.add(model).subscribe(data => {
      
        if(data.success=="true"){  
          this.successStatus=true;
          
          document.getElementById("clientsave").style.display = "none";
          setTimeout(function(){ 

             location.reload();
           },500);
         
          

        }
        else{
             
              this.failStatus=true;
        }
       
      
      });

 

}

validateUsername(event:any) {  
    
  this.username = event.target.value;
   if(  this.username && this.username.length>=6){
      this.usernameStatus = true;
      this.usernameStatusError = false;
   }
   else{
      this.usernameStatus = false;
      this.usernameStatusError = true;
   } 

  if(this.mobile!=undefined && this.lastname!=undefined && this.firstname!=undefined && this.email!=undefined && this.password){
    if(this.usernameStatus &&   this.passwordStatus &&  this.emailStatus &&  this.firstnameStatus &&  this.lastnameStatus && this.mobileStatus){
     this.validationStatus = true;
   }
   else{
     this.validationStatus = false;
   }
     }
}

validatePassword(event:any){
this.password = event.target.value;
   if(  this.password && this.password.length>=6){
      this.passwordStatus = true;
      this.passwordStatusError = false;
   }
   else{
      this.passwordStatus = false;  
            this.passwordStatusError = true;

   }

  if(this.mobile!=undefined && this.lastname!=undefined && this.firstname!=undefined && this.email!=undefined){
    if(this.usernameStatus &&   this.passwordStatus &&  this.emailStatus &&  this.firstnameStatus &&  this.lastnameStatus && this.mobileStatus){
     this.validationStatus = true;
   }
   else{
     this.validationStatus = false;
   }
     }
  
}

validateEmail(event:any){
     var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
this.email = event.target.value;
   if(this.email && reg.test(event.target.value) == true){
      this.emailStatus = true;
      this.emailStatusError =  false; 
   }
   else{
      this.emailStatus = false;  
            this.emailStatusError = true;

   }

    if(this.mobile!=undefined && this.lastname!=undefined && this.firstname!=undefined){
    if(this.usernameStatus &&   this.passwordStatus &&  this.emailStatus &&  this.firstnameStatus &&  this.lastnameStatus && this.mobileStatus){
     this.validationStatus = true;
   }
   else{
     this.validationStatus = false;
   }
     }
}

 
validateFirstname(event:any){
this.firstname = event.target.value;
   if(this.firstname && isNaN(this.firstname)){
      this.firstnameStatus = true;
      this.firstnameStatusError = false;
   }
   else{
      this.firstnameStatus = false;  
      this.firstnameStatusError = true;
   }

     if(this.mobile!=undefined && this.lastname!=undefined){
    if(this.usernameStatus &&   this.passwordStatus &&  this.emailStatus &&  this.firstnameStatus &&  this.lastnameStatus && this.mobileStatus){
     this.validationStatus = true;
   }
   else{
     this.validationStatus = false;
   }
     }
}

 
  

validateLasttname(event:any){
this.lastname = event.target.value;
   if(this.lastname && isNaN(this.lastname)){
      this.lastnameStatus = true;
      this.lastnameStatusError= false;
   }
   else{
      this.lastnameStatus = false;  
       this.lastnameStatusError= true;
   }

     if(this.mobile!=undefined){
    if(this.usernameStatus &&   this.passwordStatus &&  this.emailStatus &&  this.firstnameStatus &&  this.lastnameStatus && this.mobileStatus){
     this.validationStatus = true;
   }
   else{
     this.validationStatus = false;
   }
     }


}

  
 

validateMobile(event:any){
this.mobile = event.target.value;
   if(this.mobile){
      this.mobileStatus = true;
     this.mobileStatusError=false;
   }
   else{
      this.mobileStatus = false;  
           this.mobileStatusError=true;

   }


   if(this.usernameStatus &&   this.passwordStatus &&  this.emailStatus &&  this.firstnameStatus &&  this.lastnameStatus && this.mobileStatus){
     this.validationStatus = true;
   }
   else{
     this.validationStatus = false;
   }
}


deleteaclient(cid){   
  
   
  (<HTMLInputElement>document.getElementById("modalDeleteId")).value = cid;
 
  document.getElementById("hiddenDelete").click();

}

editclient(cid){   

  console.log("===cid",cid);   

  this.DashboardService.getClientById(cid).subscribe(data => { 
        
        console.log("=======>",data);
    (<HTMLInputElement>document.getElementById("emailEdit")).value = data.data[0].userobject__email;
    (<HTMLInputElement>document.getElementById("firstnameEdit")).value = data.data[0].userobject__first_name;
      (<HTMLInputElement>document.getElementById("lastnameEdit")).value = data.data[0].userobject__last_name;
    /*  
    (<HTMLInputElement>document.getElementById("mobile_noEdit")).value = data.data[0].mobile;
  */
    (<HTMLInputElement>document.getElementById("userId")).value = data.data[0].userid;
     
        });
 
 

       document.getElementById("hiddenEdit").click();
}

updateclient(){
  console.log("====update client===")
  this.updateData.email =  (<HTMLInputElement>document.getElementById("emailEdit")).value;
  console.log("this.updateData",this.updateData)
  this.updateData.firstname =  (<HTMLInputElement>document.getElementById("firstnameEdit")).value;
  console.log("this.updateData",this.updateData)
  this.updateData.lastname =  (<HTMLInputElement>document.getElementById("lastnameEdit")).value;
  
  console.log("this.updateData",this.updateData)
  var id = (<HTMLInputElement>document.getElementById("userId")).value;


  console.log("id",id)
  console.log("this.updateData=====>",this.updateData)
   this.DashboardService.EditClient(id,this.updateData).subscribe(data => {
    
        
        this.EditsuccessStatus = true;
       
         setTimeout(function(){ 

             location.reload();
           },1000);
         
      
      }); 



}

DeleteClient(iid){

  this.deleteUser.user_id =iid;
   
   
   

   this.DashboardService.DeleteClient(this.deleteUser).subscribe(data => {
             
          this.DeleteStatus = true;
          document.getElementById("deleteClientBtn").style.display = "none";
          setTimeout(function(){ 

             location.reload();
           },1000);
         
          

     }); 

}

status(e,id){
   var status = e.target.checked;
   if(status){
       this.DashboardService.ActiveClient(id).subscribe(data => {
         
     }); 


   }else{
     this.DashboardService.DeactiveClient(id).subscribe(data => {
        
     }); 

   }
 
}
change_conceptStatus(id){

  this.DashboardService.changeConceptStatus(id).subscribe(data => {         
  });
}


change_stopList(id){

  this.DashboardService.changeStopListStatus(id).subscribe(data => {         
  });


}
AddManaul()
{
  
  this.DashboardService.adduserManual(this.file).subscribe(data => {
    
      localStorage.setItem("pdfName",data.pdfname);
      sessionStorage.setItem("pdfName",data.pdfname);
      var copy = Object.assign({}, data.pdfname);
      window.location.reload()
      console.log("api called");    
        
      });
}
file: File;
onChange(event: EventTarget) {
        let eventObj: MSInputMethodContext = <MSInputMethodContext> event;
        let target: HTMLInputElement = <HTMLInputElement> eventObj.target;
        let files: FileList = target.files;
        this.file = files[0];
        console.log(this.file);
  }


}
