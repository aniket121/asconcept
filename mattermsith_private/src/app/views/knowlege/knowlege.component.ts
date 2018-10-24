import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { ReviewService } from './knowlege.service';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import {NgForm} from '@angular/forms';

import * as _ from 'lodash';  
@Component({
  selector: 'app-login',
  templateUrl: './knowlege.component.html',
  styleUrls: ['./knowlege.component.scss'],
  providers: [ ReviewService ],
})
export class KnowlegeComponent implements OnInit {
  listUsers:string ='';
  userRoles:string = '';
  public msgs:any=[];
  public modal_title:string = "";

  public showDialog:boolean = false;//modal status
  public deleteDialog:boolean =false;

  public user={};
  public userd={};
  public duplicate_users:any;
  public all_users:any =  {};
  public role_status:boolean =false;
  public transactions: {
    id :number,
    action:any,
    username: string,
    online: string,
    firstname: string,
    middlename: string,
    lastname:string,
    email:string,
    country:string,
    role:string,
  }[];
  
  onlineuser :any = [];
  userStaus:any=[]
  public userObject=<any>{};
  optionsModel: number[];
  myOptions: IMultiSelectOption[];
  constructor(private router: Router,private reviewService : ReviewService) {

   }

  ngOnInit() {
 
        
      this.transactions = [
        {
          id : 1,
          action:'',
          username: 'test',
          online: 'online',
          firstname: 'TestUser',
          middlename: 'testmiddle',
          lastname:'testLast',
          email:'ani@gmail.com',
          country:'US',
          role:'adminstrator',
        },
        {
          id :2,
          action:'',
          username: 'demo',
          online: 'offline',
          firstname: 'DemoUser',
          middlename: 'demomiddle',
          lastname:'demoLast',
          email:'pravin@gmail.com',
          country:'India',
          role:'User',
        },
        {
          id :3,
          action:'',
          username: 'demo',
          online: 'offline',
          firstname: 'DemoUser',
          middlename: 'demomiddle',
          lastname:'demoLast',
          email:'pravin@gmail.com',
          country:'India',
          role:'User',
        },
        {
          id :4,
          action:'',
          username: 'demo',
          online: 'offline',
          firstname: 'DemoUser',
          middlename: 'demomiddle',
          lastname:'demoLast',
          email:'pravin@gmail.com',
          country:'India',
          role:'User',
        },
        {
          id :5,
          action:'',
          username: 'demo',
          online: 'offline',
          firstname: 'DemoUser',
          middlename: 'demomiddle',
          lastname:'demoLast',
          email:'pravin@gmail.com',
          country:'India',
          role:'User',
        },
        {
          id :6,
          action:'',
          username: 'demo',
          online: 'offline',
          firstname: 'DemoUser',
          middlename: 'demomiddle',
          lastname:'demoLast',
          email:'pravin@gmail.com',
          country:'India',
          role:'User',
        },
        {
          id :7,
          action:'',
          username: 'demo',
          online: 'offline',
          firstname: 'DemoUser',
          middlename: 'demomiddle',
          lastname:'demoLast',
          email:'pravin@gmail.com',
          country:'India',
          role:'User',
        },
        {
          id :8,
          action:'',
          username: 'demo',
          online: 'online',
          firstname: 'DemoUser',
          middlename: 'demomiddle',
          lastname:'demoLast',
          email:'pravin@gmail.com',
          country:'India',
          role:'User',
        },
        
      ]    

       this.onlineuser = []
       this.onlineuser.push({label: 'All', value:null});
       this.onlineuser.push({label: 'online', value: 'online'});
       this.onlineuser.push({label: 'offline', value: 'offline'});
       this.userStaus=[];
       this.userStaus.push({label: 'active', value: 'active'});
       this.userStaus.push({label: 'Inactive', value: "Inactive"});
       this.myOptions = [
            { id: 1, name: 'Option 1' },
            { id: 2, name: 'Option 2' },
        ];
        this.duplicate_users =  _.cloneDeep(this.transactions);
  }
  
 onChange() {
        console.log(this.optionsModel);
        

    }
  showSuccess(recordStatus) {
    this.msgs =[{severity:'success', summary:recordStatus}];
  }
  addUser(){
    this.userObject ={};
    this.showDialog = !this.showDialog;
    this.modal_title = "Add User";
  }
  
  saveUser(){
    
    if(this.optionsModel)
    {
      var role = <any>{};
     this.userObject.role=this.optionsModel
     console.log('---------userdata---------',this.userObject)
    }
    else
    {
      console.log("please select role first");
      this.role_status=true;
    }
  }

  delete(data,position){
    this.modal_title = "Delete User";
    this.deleteDialog = true;//modal status
  }
  deleteUser(){
     this.showSuccess('User has been deleted');
     this.deleteDialog =false;   
  }

  edit(data,position){
    this.modal_title = "Edit User";
    this.userObject = data;
    this.showDialog = true;    
  }
  userStatus($event){
    this.transactions = this.duplicate_users;
    let element = event.currentTarget as HTMLInputElement;
    let value = element.value;
    if(value == '1'){
      var online = [];
      for(let i in this.transactions){
        if(this.transactions[i]['online'] == 'online'){
          online.push(this.transactions[i])          
        }
      }
      this.transactions = online;     
    }
    else if(value == '2'){
      var offline = [];
      for(let i in this.transactions){
        if(this.transactions[i]['online'] == 'offline'){
          offline.push(this.transactions[i])          
        }
      }
      this.transactions = offline;
    }
  }

}



