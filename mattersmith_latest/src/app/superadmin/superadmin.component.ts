import { Component, OnInit } from '@angular/core';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { UserService } from './superadmin.service';
import { RouterModule, Router } from '@angular/router';
import * as _ from 'lodash'; 
import { Cookie } from 'ng2-cookies/ng2-cookies';
// import { create } from 'domain';

@Component({
  selector: 'app-superadmin',
  templateUrl: './superadmin.component.html',
  styleUrls: ['./superadmin.component.scss']
})

export class SuperadminComponent implements OnInit {

  public msgs:any=[];  
  public modal_title:string = "";
  public duplicate_users:any;
  public all_users:any =  {};
  public role_status:boolean =false;
  public hideField:boolean = false;
  public hideCheckbox:boolean=false;
  public activeobject={}
  public selectedRole=''
  public showDialog:boolean = false;//modal status
  public deleteDialog:boolean =false;
  public selected_role:number = 1;
  public passwordField:boolean=true;
  public user_id:any;
  public duplicateUser:boolean=false;
  public user:any={};
  public duplicate:boolean=false;
  public deleteorgDialog:boolean=false;
  public addOrgnaisation:boolean=false;
  public duplicateorg:boolean=false
  public org_id:any;
  public org={orgname:'',orgemail:''}
  public orglist:{}[]
  public selectedOrg:any;
  public roleName:string;
  public users: {
    id :number,
    action:any,
    username: string,
    first_name: string,
    last_name:string,
    email:string,
    is_active:string,
    user_limit:string,
    is_staff:string,
    rw_permission : string,
    org : string

  }[];

  public user_role = {
    user_limit_state : true,

  };

  constructor(private router: Router,private userService : UserService) {}

  
  ngOnInit() {
      this.roleName='Admin';
      var id =  Cookie.get('user_id')
      this.userService.getUsers(id).subscribe((res: any) => {
      this.users =  res  
      console.log(this.users);        
      }, error => {               
        console.info('error', error);
      });
      this.userService.getOrganisation().subscribe((res: any) => {
      
      this.orglist=res.org
      console.log(this.orglist); 
    
      }, error => {               
        console.info('error', error);
      })
      
    
  }
  ngAfterViewInit(){

  }

  validateUser(){
    for(var i=0;i<this.users.length;i++){
       if(this.users[i]["email"]==this.user.email){
         console.log("duplicate")
         this.duplicate=true;
       }
       else{
         this.duplicate=false;
       }
    }
  }

  addUser(){    
    this.user ={};
    this.passwordField=true;
    this.roleName='Admin';
    this.selected_role = 1
    this.user_id = 0
    this.user.rw_permission = 0;
    this.user.is_staff = 1
    this.showDialog = !this.showDialog;
    this.modal_title = "Add User";
  }

  changeRole(role:number){

    if(role == 1){
      this.user_role['user_limit_state']=true;
      this.user.is_staff =  1;
      this.user.rw_permission = 0;  
      this.roleName='Admin';    
    }
    if(role == 2){
       this.user_role['user_limit_state']=false;
       this.user.is_staff = 0;
       this.user.rw_permission = 1;
       this.user.user_limit = 0;
       this.roleName='Editor';
    }
    if(role == 3){
      this.user_role['user_limit_state']=false;
      this.user.rw_permission = 0;
      this.user.is_staff =  0;
      this.user.user_limit = 0;
       this.roleName='Viewer';
    }  
  }

  showSuccess(recordStatus) {
    this.msgs =[{severity:'success', summary:recordStatus}];
  }
  showError(recordStatus) {
    this.msgs =[{severity:'info', summary:recordStatus}];
  }

  edit(user){
    console.log(user);

    this.user = {}
    if(user.is_staff == 'Admin'){
      this.user.is_staff = 1  
      this.selected_role = 1
    }if(user.is_staff == 'Editor'){
      this.user.is_staff = 0
      this.selected_role = 2
    }if(user.is_staff == 'Viewer'){
      this.user.is_staff = 0
      this.selected_role = 3
    }
    this.user.org=user.Organization
    this.passwordField=false;
    this.modal_title = "Edit User";
    
    this.user = user;
    this.roleName=this.user.is_staff 
    console.log(typeof(this.user.is_staff));
    this.showDialog = true;    
  }

  saveUser(){
    if(this.user.id){
      this.updateUser();
    }else{
      this.createUser()
    }
     this.showDialog=false;
     //this.user = {}
  }

  createUser(){
    if(this.user.is_staff === 1){
      this.user.username = this.user.username +'-' + 'admin';
      this.selectedRole="admin"
    }
    else if(this.user.rw_permission === 1){
      this.user.username = this.user.username + '-' + 'editor'
      this.selectedRole="editor"
    }
    else{
      this.user.username = this.user.username + '-' + 'viewer'
      this.selectedRole="viewer"
    }
    this.user.created_by = Cookie.get('user_id')
    console.log(this.users);
    this.user.org=this.selectedOrg;
    this.userService.addUser(this.user).subscribe((res: any) => {
      if(res.msg==="duplicate"){
      this.duplicateUser=true;
      this.showDialog=true;
      }
      
      let role='';
      if(this.selectedRole === "admin"){
        role="Admin";
      }
      else if(this.selectedRole === "editor"){
        role="Editor";
      }
      else{
        role="Viewer"
      }

      if(res.status == 201){
          if(res.msg=="duplicate"){
          this.showError("Username/Email already exits !")
          }else{
          this.showSuccess(role+' '+' has been added successfully');
          }
          this.showDialog =false;
          this.ngOnInit()   
      }}, error => {       
          console.info('error', error);         
      })
  }

  updateUser(){
    if(this.user.is_staff == 'Editor'){
        this.user.is_staff = 0
    }else if(this.user.is_staff == 'Viewer'){
        this.user.is_staff = 0
    }else if(this.user.is_staff == 'Admin'){
        this.user.is_staff = 1
    }
    
    if(this.user.is_staff === 1){
      var username = this.user.username.split("-");
      this.user.username = username[0] +'-' + 'admin'
      this.user.rw_permission = 0;
    }
    else if(this.user.rw_permission === 1){
      var username = this.user.username.split("-");
      this.user.username = username[0] + '-' + 'editor'
      this.user.is_staff = 0;
      this.user.user_limit = 0
      this.user.rw_permission = 1;
    }
    else{
      var username = this.user.username.split("-");
      this.user.username = username[0] + '-' + 'viewer'
      this.user.rw_permission = 0;
      this.user.is_staff = 0;
      
    }
    if(this.user.rw_permission == 0 && this.user.is_staff ==0 ){
      //this.user.is_staff = 0;
      //this.user.user_limit = 0
      //var username = this.user.username.split("-");
      //this.user.username = username[0];
    }
    this.user.org=this.selectedOrg;
    this.userService.updateUser(this.user).subscribe((res: any) => {
      if(res.status == 201){
          this.showSuccess('Record edited successfully');
          this.showDialog =false;
          this.ngOnInit()   
      }}, error => {       
          console.info('error', error);         
      })
  }

  changeUserStatus(user){
    this.userService.changeUserStatus(user.id).subscribe((res: any) => {
      if(res.status == 200){
          this.showSuccess('Status Updated successfully');
          this.showDialog =false;
          this.ngOnInit()   
      }}, error => {       
          console.info('error', error);         
      })
  }

  delete(id){
    this.modal_title = "Delete User";
    this.deleteDialog = true;//modal status
    this.user_id=id;   
  }

  deleteUser(){
    this.deleteDialog =false; 
    this.userService.deleteUser(this.user_id).subscribe((res: any) => {   
      if(res.status == 200){
        this.showSuccess('User has been deleted');
        this.showDialog =false;
        this.ngOnInit()   
      }}, error => {
          console.info('error', error);
      })
  }
  addOrg(){
    this.addOrgnaisation=true;
    this.duplicateorg=false;
    this.org={orgname:'', orgemail:''}
  }
  saveOrg(){
    console.log(this.org);
     this.userService.addOrganisation(this.org).subscribe((res: any) => {   
      if(res.status == 200){
       
        this.showDialog =false;
        if(res.msg=="duplicate"){
        this.addOrgnaisation=true;
        this.duplicateorg=true;
        }else{
        this.addOrgnaisation=false;
         this.showSuccess('Orginsation has been added Successfully');
        }
        this.ngOnInit()   
      }}, error => {
          console.info('error', error);
      })
  }
  deleteorgid(id){
    this.org_id=id;  
    this.deleteorgDialog=true; 
  }
deleteorg(){
    this.userService.deleteOrganisation(this.org_id).subscribe((res: any) => {   
      if(res.status == 200){
        this.showSuccess('Organisation has been deleted');
        this.showDialog =false;
        this.ngOnInit()   
      }}, error => {
          console.info('error', error);
      })
      this.deleteorgDialog=false;
      this.addOrgnaisation=false;
     
  
}
changeOrg(data:any){
this.selectedOrg=data;
console.log(this.selectedOrg)
}
}