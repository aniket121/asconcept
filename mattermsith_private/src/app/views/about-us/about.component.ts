import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class CustomerComponent implements OnInit {

   public transactions: {
      contact_date: Date,
      name: string,
      email: number,
      TAT:number,
      FAT:number,
      Fax_N0:number,
      cite:string,
      state:string,
      pincode:number,
      street:string,
      country:string,
      action:any

    }[];
  public customer={};
  public customerAssociation={};
  public deleteDialog:Boolean=false;
  public tabStatus:Boolean=true;
  public contract={};
  subAccount=[]
  public SubAccount:Boolean=false;
  constructor(private router: Router) {
   }

  ngOnInit() {
      this.transactions = [
        {
          contact_date: new Date(2017, 10, 10, 13, 10, 15),
          name: 'test',
          email: 130,
          TAT:8,
          FAT:56,
          Fax_N0:33,
          cite:'pune',
          state:"Maharastra",
          pincode:411023,
          street:'xyz',
          country:"USA",
          action:''
        },
         {
          contact_date: new Date(2017, 10, 10, 13, 10, 15),
          name: 'test',
          email: 131,
          TAT:8,
          FAT:56,
          Fax_N0:33,
          cite:'pune',
          state:"Maharastra",
          pincode:411023,
          street:'xyz',
          country:"INDIA",
          action:''
        },
        {
          contact_date: new Date(2017, 10, 10, 13, 10, 15),
          name: 'test',
          email: 131,
          TAT:8,
          FAT:56,
          Fax_N0:33,
          cite:'pune',
          state:"Maharastra",
          pincode:411023,
          street:'xyz',
          country:"SL",
          action:''
        }
        
        
      ]
  }
  showCustomerDialog()
  {
    this.deleteDialog = !this.deleteDialog;
    //this.modal_title = "Add Customer";
  }
  saveCustomer()
  {
    console.log(" in save save customer api",this.customer);
    this.tabStatus=false;
  }
  customerAssociationHandler()
  {
    console.log("customer assocation",this.customerAssociation);
  }
  addSubAccount(subAccountObject:any)
  {
     console.log("sub account",subAccountObject)
     this.subAccount.push(subAccountObject);
     console.log("subaccount",this.subAccount);
  }
  addcontract(contract:any)
  {
     console.log("sub account",contract)
  }
  SelectTabContent(Content:any)
  {
    if(Content=="SubAccount")
    {
      this.SubAccount=true;
    }
    else{
      this.SubAccount=false;
    }
  }
}
