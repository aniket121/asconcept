import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import { Cookie } from 'ng2-cookies/ng2-cookies';
declare var $: any;

@Component({
  selector: 'sa-header',
  templateUrl: './sa-header.component.html',
  styleUrls:['sa-header.component.scss']
})
export class HeaderComponent implements OnInit {
  public firstname:any;
  constructor(private router: Router) {
  }

  ngOnInit() {
   this.firstname=Cookie.get("firstname")
  }
  logout()
  {
    localStorage.clear();
    Cookie.deleteAll()
    this.router.navigate(["/login"])
    
  }
}