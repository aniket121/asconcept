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

  public showDialog:boolean = false;//modal status
  public deleteDialog:boolean =false;
  public selected_role:number = 1;
  public passwordField:boolean=true;
  public user_id:any;
  public user:any={};

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
    rw_permission : string

  }[];

  public user_role = {
    user_limit_state : true,

  };

  constructor(private router: Router,private userService : UserService) {}

  ngOnInit() {
      var id =  Cookie.get('user_id')
      this.userService.getUsers(id).subscribe((res: any) => {
      this.users =  res          
      }, error => {               
        console.info('error', error);
      })
  }

  addUser(){    
    this.user ={};
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
    }
    if(role == 2){
       this.user_role['user_limit_state']=false;
       this.user.is_staff = 0;
       this.user.rw_permission = 1;
       this.user.user_limit = 0;
    }
    if(role == 3){
      this.user_role['user_limit_state']=false;
      this.user.rw_permission = 0;
      this.user.is_staff =  0;
      this.user.user_limit = 0;
    }  
  }

  showSuccess(recordStatus) {
    this.msgs =[{severity:'success', summary:recordStatus}];
  }

  edit(user){
    this.user = {}
    if(user.is_staff == 'Admin'){
      this.user.is_staff = 1  
      this.selected_role = 1
    }if(user.is_staff == 'Viewer'){
      this.user.is_staff = 0
      this.selected_role = 2
    }if(user.is_staff == 'User'){
      this.user.is_staff = 0
      this.selected_role = 3
    }
    this.passwordField=false;
    this.modal_title = "Edit User";    
    this.user = user;
    this.showDialog = true;    
  }

  saveUser(){
    if(this.user.id){
      this.updateUser();
    }else{
      this.createUser()
    }
  }

  createUser(){
    if(this.user.is_staff === 1){
      this.user.username = this.user.username +'-' + 'admin'
    }
    if(this.user.rw_permission === 1){
      this.user.username = this.user.username + '-' + 'viewer'
    }
    this.user.created_by = Cookie.get('user_id')
    this.userService.addUser(this.user).subscribe((res: any) => {
      if(res.status == 201){
          this.showSuccess('Admin has been added successfully');
          this.showDialog =false;
          this.ngOnInit()   
      }}, error => {       
          console.info('error', error);         
      })
  }

  updateUser(){
    if(this.user.is_staff == 'User'){
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
    if(this.user.rw_permission === 1){
      var username = this.user.username.split("-");
      this.user.username = username[0] + '-' + 'viewer'
      this.user.is_staff = 0;
      this.user.user_limit = 0
      this.user.rw_permission = 1;
    }
    if(this.user.rw_permission == 0 && this.user.is_staff ==0 ){
      this.user.is_staff = 0;
      this.user.user_limit = 0
      var username = this.user.username.split("-");
      this.user.username = username[0];
    }
    this.userService.updateUser(this.user).subscribe((res: any) => {
      if(res.status == 201){
          this.showSuccess('Admin has been Updated successfully');
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
}