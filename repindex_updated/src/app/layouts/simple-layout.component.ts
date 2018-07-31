import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: '<router-outlet><header class="app-header navbar"><img src="assets/img/LOG.png" width=150><p class="left"> <a *ngIf="username" class="dropdown-item" href="#" (click)="logout()"><i class="fa fa-lock"></i> LogOut</a></p></header></router-outlet>',
  styles: [`
    .left{
     margin-left:74% !important;
     height:10px !important;

    }
    .dropdown-item{
    background-color:#808080 !important;
    margin-left: 75px;
    margin-top: 10px;
    color:white;
    },
  `],
  
})
export class SimpleLayoutComponent implements OnInit {

  public  username:any;
  constructor() { }

  ngOnInit(): void { 

   this.username=localStorage.getItem("username");
  }
  logout()
  {
     localStorage.clear();
     window.location.reload()
  }
}

