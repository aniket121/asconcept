import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { chartsService } from './charts.service';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Observable, Subject } from 'rxjs/Rx';
import { ModalDirective } from 'ng2-bootstrap/modal/modal.component';
import * as _ from "lodash";
declare var $: any;
var that;
@Component({
  templateUrl: 'charts.component.html'
  
})
export class chartsComponent implements OnInit {
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
public frequency_array: any = [];
public term_array: any = [];

 private usernameStatusError :boolean=false;
 private passwordStatusError :boolean=false;
 private emailStatusError :boolean=false;
  private firstnameStatusError :boolean=false;
   private lastnameStatusError :boolean=false;
   private mobileStatusError :boolean=false;
   public arr:any =[];
 private validationStatus :boolean=false;
   public newlimit=700;
   public selectlimit="700";
   public lineChartData :any =[];
   public lineChartLabels:any=[];
   public lineChartOptions:any=[];
   public lineChartColours:any=[];
   public lineChartLegend:boolean=false;
   public lineChartType:string;
   public barChartOptions:any;
   public barChartLabels:string;
   public barChartType:string;
   public barChartLegend:boolean=false;
   public barChartData:any=[];
   public pieChartLabels:any=[];
   public pieChartData:any=[];
   public pieChartType:string;
   constructor( private router: Router,private DashboardService: chartsService, private http: Http, private cdrf: ChangeDetectorRef) {
 this.router=router;
  that = this;
 }

  



  ngOnInit(): void {

  //alert("ngonit called");
  var myArray=[];
  var frquecy_data=localStorage.getItem("frequency_data");
  var gettextname= localStorage.getItem("text_list_name");
 
      //alert("exact limit===>"+this.newlimit);
      
  var jsonArray = JSON.parse(frquecy_data)
   for(var i=0;i<jsonArray.length;i++)
   {   
      if(i < this.newlimit ){
         if(jsonArray[i].count>0)
         {
           this.frequency_array.push(jsonArray[i].count);
           this.term_array.push(jsonArray[i].term)
          }
       console.log("========i=========",i)
      }
        
   }
 
   // console.log("count======",this.frequency_array);
    //console.log("terms==========",this.term_array);
     
 
  this.lineChartData= [
   
    {data: this.frequency_array, label: gettextname},
    
  ];

  this.lineChartLabels= this.term_array;
  this.lineChartOptions= {
    animation: false,
    responsive: true
  };
  this.lineChartColours= [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    
  ];

  this.lineChartLegend= true;
  this.lineChartType= 'line';

 

  // barChart
  this.barChartOptions= {
    scaleShowVerticalLines: false,
    responsive: true
  };
  this.barChartLabels= this.term_array;
  this.barChartType= 'bar';
  this.barChartLegend= true;

  this.barChartData= [
    
    {data: this.frequency_array, label: gettextname}
  ];

  // Pie
  this.pieChartLabels= this.term_array;
  this.pieChartData= this.frequency_array;
  this.pieChartType= 'pie';
  
}
 
limit(limit)
 {
   console.log("limit",limit);
   //alert(limit)
  
   this.newlimit=limit;
   this.frequency_array=[];
   this.term_array=[];
   this.ngOnInit();

 }




}