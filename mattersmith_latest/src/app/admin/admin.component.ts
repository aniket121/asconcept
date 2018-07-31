import { Component, OnInit } from '@angular/core';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { RouterModule, Router } from '@angular/router';
import * as _ from 'lodash'; 
import { AdminService } from './admin.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  providers:[AdminService]
})
export class AdminComponent implements OnInit {

  public users: {
    id :number,
    action:any,
    username: string,
    first_name: string,
    last_name:string,
    email:string,
  }[];
  public user:any = {}
  public delete_id:boolean;
  public hidePasswordField:boolean =false;
  public modal_title:string = "";
  public showDialog:boolean = false;//modal status
  public deleteDialog:boolean =false;
  public msgs:any=[];
  public limitDialog = false;
  

  constructor(private router: Router,public AdminService:AdminService) {}

  ngOnInit() {
    var id = Cookie.get('user_id')
    this.AdminService.getUsers(id).subscribe((res: any) => {
    this.users =  res          
    }, error => {               
      console.info('error', error);
    })
  }

  addUser(){
      var count = Cookie.get('user_limit')
      if( Number(count) > this.users.length){
      this.hidePasswordField=true;
      this.user ={};
      this.showDialog = !this.showDialog;
      this.modal_title = "Add User";
      }else{
        this.limitDialog = true;
      }
  }

  edit(data){
    this.hidePasswordField=false;
    this.modal_title = "Edit User";
    this.user = data;
    this.showDialog = true;    
  }  

  changeRole(role:number){
    if(role == 1){
       this.user.rw_permission = 1;
       
    }
    if(role == 2){
      this.user.rw_permission = 0;
     
    }  
  }

  showSuccess(recordStatus) {
    this.msgs =[{severity:'success', summary:recordStatus}];
  }

  saveUser(){
    if(this.user.id){
      this.updateUser();
    }else{
      this.createUser()
    }
  }


  createUser(){
    this.user.is_staff = 0;
    
    if(this.user.rw_permission === 1){
      this.user.username = this.user.username + '-' + 'viewer'
    }else{
      this.user.rw_permission = 0
    }
    this.user.created_by = Cookie.get('user_id')
    this.AdminService.addUser(this.user).subscribe((res: any) => {
      if(res.status == 201){
          this.showSuccess('User has been added successfully');
          this.showDialog =false;
          this.ngOnInit()   
      }}, error => {       
          console.info('error', error);         
      })
  }

  updateUser(){
    this.user.is_staff = 0;
    if(this.user.rw_permission === 1){
      var username = this.user.username.split("-");
      this.user.username = username[0] + '-' + 'viewer'
    }else{
      var username = this.user.username.split("-");
      this.user.username = username[0] 
      this.user.rw_permission = 0
    }
    this.AdminService.updateUser(this.user).subscribe((res: any) => {
      if(res.status == 201){
          this.showSuccess('User has been Updated successfully');
          this.showDialog =false;
          this.ngOnInit()   
      }}, error => {       
          console.info('error', error);         
      })
  }

  delete(id){
    this.modal_title = "Delete User";
    this.deleteDialog = true;//modal status
    this.delete_id=id;   
  }

  deleteUser(){
    this.deleteDialog =false; 
    this.AdminService.deleteUser(this.delete_id).subscribe((res: any) => {   
      if(res.status == 200){
        this.showSuccess('User has been deleted');
        this.showDialog =false;
        this.ngOnInit()   
      }}, error => {
          console.info('error', error);
      })
  }
}
