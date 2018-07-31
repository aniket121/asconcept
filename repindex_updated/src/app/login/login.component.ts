import { Component } from '@angular/core';
import { repindexService } from '../repindex.service';
import { Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { LoginService } from './login.service';
import { ModalDirective } from 'ng2-bootstrap/modal/modal.component';
import { Input} from '@angular/core';
@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})


export class LoginComponent {

private validationStatus :boolean=false;
private usernameStatus :boolean=false;
private passwordStatus :boolean=false;
private usernameStatusError :boolean=false;
private passwordStatusError :boolean=false;
private loginfail :boolean=false;
@Input() model="helllllo";   
private uusername;
  userdata: any = {};
  email: any = {};
  password: any = {};
  errormsg:boolean;
  succssmsg:boolean=false;
  updatepasswordmg:any;
  popupscreen:boolean=false;
  passwordsame:boolean=false;

 constructor( private router: Router,private LoginService: LoginService) {
 this.router=router;
  var access=window.location.href.split("/");
    console.log(access.includes('token'))
     if (access.includes('token')){
       this.popupscreen=true;
        console.log(this.popupscreen)
        var token=access[access.length-1];
     
        localStorage.setItem("token",token );
       
     }
     else
     {
        this.popupscreen=false;
     }
  
 }
authenticate(name,password)
{
     
      this.userdata.username = name;
      this.userdata.password = password;
      this.LoginService.login(this.userdata).subscribe(data => {
       localStorage.setItem('username',data.username);
      if(data.user_type=="admin")  {
         localStorage.setItem('userId',data.user_id);
         localStorage.setItem("lang","en");
          localStorage.setItem('conceptStatus',data.concept_status);
          localStorage.setItem('stoplist_status',data.stoplist_status);
         localStorage.setItem('usertype',data.user_type);
         this.router.navigate(['/dashboard']);
         //setTimeout(function(){ window.location.reload() }, 300);
      }
      else if(data.user_type=="user"){

          
         localStorage.setItem('userId',data.user_id);
         
           localStorage.setItem('counter',"0");
            localStorage.setItem('conceptStatus',data.concept_status);
            localStorage.setItem('stoplist_status',data.stoplist_status);
             localStorage.setItem("backProjectCounter","0" ); 
          this.router.navigate(['/project']);
      }  
       else if(data.user_type=="superuser"){

          
         localStorage.setItem('userId',data.user_id);
         localStorage.setItem('usertype',data.user_type);
         localStorage.setItem('conceptStatus',data.concept_status);
         localStorage.setItem('stoplist_status',data.stoplist_status);            
          this.router.navigate(['/superdashboard']);
      }  
      else
      {
        this.loginfail=true;
        this.router.navigate(['/login']);
      }
      });
 
 

}

 validateUsername(event:any) {  
    this.uusername = event.target.value;
         


       if(this.uusername){
              this.usernameStatus = true;
       this.usernameStatusError = false;
       }
       else{
      
        this.usernameStatus = false;
        this.usernameStatusError = true;
       }


        if(this.usernameStatus &&  this.passwordStatus){
      this.validationStatus = true;
       }
       else{
      this.validationStatus = false;
       }



  }

  validatePassword(event:any){
     
       var pass = event.target.value;
            
       if(pass){
      this.validationStatus = true;
       this.passwordStatus = true;
       this.passwordStatusError = false;
       }
       else{
       this.validationStatus = false;
        this.passwordStatus = false;
         this.passwordStatusError = true;
       }
       
  
       if(this.usernameStatus &&  this.passwordStatus){
      this.validationStatus = true;
       }
       else{
      this.validationStatus = false;
       }

      

  }
  forgotPopUp()
  {
    document.getElementById("forgot").click();
    $('#header').val('');
    $('#body').val('');
  }
  checkEmail(email)
  {
       this.email.email=email;

       this.LoginService.ValidateEmail(this.email).subscribe(data => {
           
           if(data.succss=="true")
           {
              this.succssmsg=true;
              this.errormsg=false;
              console.log("success msg==", this.succssmsg);
           }
           else
           {
              this.errormsg=true;
              this.succssmsg=false;
              console.log("error msg==", this.errormsg);
           }

           console.log(data);
        });
      
  }
  setPassword(newpass:any,confirmpass:any)
  {
    console.log(newpass);
    if(newpass=="")
    {
       this.passwordsame=true;
    }
    else if(confirmpass=="")
    {
      this.passwordsame=true; 
    }
    else if(newpass==confirmpass)
    {
       this.password.password=confirmpass;
      this.LoginService.changepassword(this.password, localStorage.getItem("token")).subscribe(data => {
           this.errormsg=data.succss;
           this.updatepasswordmg=data.msg;
           console.log(data);
        });
    }
    else{

     this.passwordsame=true;

    }
      console.log(this.passwordsame)
  }
  keyDownFunction(event) {
  if(event.keyCode == 13) {
    alert('you just clicked enter');
    console.log("you just clicked enter");
    
  }
}

}
