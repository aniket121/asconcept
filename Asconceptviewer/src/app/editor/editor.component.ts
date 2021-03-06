import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { editorService } from './editor.service';
import { DOCUMENT } from '@angular/platform-browser';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Observable, Subject } from 'rxjs/Rx';
import { Inject} from "@angular/core";
import * as _ from "lodash";
import { saveAs } from 'file-saver';
import { environment } from '../../environments/environment';
var fs = require('fs');
declare var $: any;
declare var jQuery:any
declare var CKEDITOR: any;
let jsPDF = require('jspdf');
var htmlDocx = require('html-docx-js');

@Component({
  templateUrl: 'editor.component.html'
  
})
export class editorComponent {
public content:any;
public getcontent:any;
public documentotion: any = {};
public tempData:any;
public test:any;
public router:any;
 constructor(private _router: Router,private editorService: editorService,@Inject(DOCUMENT) private document: Document)
 {
            this.router = _router;
            var dd=localStorage.getItem("fileid");
            this.editorService.getfileconten(dd).subscribe(data => {
            this.content = data[0].fields.file_content;
         
            var dd=localStorage.getItem("fileid");
            window['CKEDITOR']['replace']( 'editor1' )
            window['CKEDITOR'].config.height = '800px';
            

            var left=localStorage.getItem("left");
            var right=localStorage.getItem("right");
            var toi=localStorage.getItem("toi");
          
            this.content=this.content.replace(new RegExp("yellow", 'g'), "white") 
         
           

            var t = left.split(" ");
            var  lasttwo=t[t.length - 4]+" " +t[t.length - 3] + " "+ t[t.length - 2] +" "+ t[t.length - 1];
            var tmp=lasttwo;
            var t1 = right.split(" ");
            var firsttwo=t1[0]+" "+t1[1]+" "+t1[2]+" "+t1[3]+" "+t1[4];
            

            var len=lasttwo.split(" ")
            var len1=firsttwo.split(" ")
             
            
             var rightv=firsttwo.toString();
              var res=this.content.indexOf(rightv);
              var eachLine = rightv.split('\n');
               //alert('Lines found: ' + eachLine.length);
               console.log(firsttwo)
            if(res && eachLine.length==1 && rightv.length>1){
             // alert("1 line");
              var uppercaseFirstLetter = toi.charAt(0).toUpperCase() +  toi.slice(1);;
              console.log("uppercaseFirstLetter",uppercaseFirstLetter);
             
              var sent=left+toi+right
              var sentence=sent.toString();
              var rightv=firsttwo.toString();
              //alert(rightv);
              console.log("===rightv===",rightv)
              var tt=toi+rightv;
              var leftv=lasttwo.toString();


             
             console.log("sentence=========>",tt);

             var string =rightv;
            var re = new RegExp("^([a-z0-9]{5,})$");
            //alert(toi);
            //var regEx = new RegExp(toi, "ig");
             // var replaceMask ="<span style='background-color:yellow'>"+toi+"</span>"+rightv;
                  
              //this.content = this.content.replace(regEx, replaceMask);
           
            if(re.test(string)) 
            {
                  
                   
              console.log("Valid");
              var regEx = new RegExp(rightv, "ig");
              var replaceMask ="<span style='background-color:yellow'>"+toi+"</span>"+rightv;
                  
              this.content = this.content.replace(regEx, replaceMask);

            }
            else
            {
               console.log("Invalid");
               //alert("Invalid")
               var leftv=lasttwo.toString();
               var result= this.content.indexOf(leftv);
              var leftv = lasttwo.toString();
              var rightv=firsttwo.toString();           
            }
              var leftv=lasttwo.toString();
              var result= this.content.indexOf(rightv);
              console.log("result===>",result)
              if(result==-1){
                console.log("taking left for result")
                result= this.content.indexOf(leftv);
              }
              console.log("resut of right",result)
              var tempString = this.content.substring(0, result);
              var lineNumber = tempString.split('\n').length;
              if(lineNumber==1)
              {
                lineNumber = tempString.split('<br>').length;
              }
              
            if(window['CKEDITOR']){
            //lert("jum1")
            rightv = rightv.replace(/  +/g, ' ');
           setTimeout(function(){ window['CKEDITOR'].tools.callFunction(43,this)},4000);

           if(rightv[0]=="," || rightv[0]=="." || rightv[0]=="“" || rightv[0]=="”" || rightv[0]==")")
           {
            setTimeout(function(){ $("#cke_112_textInput").val(toi+rightv.trim())},5000);
            setTimeout(function(){ $("#cke_111_textInput").val(toi+rightv.trim())},5000);
           }
           else if(rightv[0]=="’" && rightv[1]=="s")
           {
               console.log("trimmmm-->",tt.trim())
               setTimeout(function(){ $("#cke_112_textInput").val(tt.trim())},5000);
               setTimeout(function(){ $("#cke_111_textInput").val(tt.trim())},5000);
           }
           else
           {
            setTimeout(function(){ $("#cke_112_textInput").val(toi+" "+ rightv.trim())},6000);
            setTimeout(function(){ $("#cke_111_textInput").val(toi+" "+rightv.trim())},6000);
           }
            setTimeout(function(){ document.getElementById("cke_119_uiElement").click()},7000);
            setTimeout(function(){ document.getElementById("cke_118_uiElement").click()},7000);
            setTimeout(function(){ document.getElementById("cke_dialog_close_button_107").click() }, 8000);
            setTimeout(function(){ document.getElementById("cke_166_uiElement").click() }, 8000);
            setTimeout(function(){ document.getElementById("cke_dialog_body").click() }, 9000);
            }
         
          }


           else{
             console.log("=====2=====")
                 // alert("===2===")
                 var rightv=firsttwo.toString();
                  var leftv=lasttwo.toString();
                  var toistr=''+toi.toString();
                  var leftv = lasttwo.toString();
              var rightv=firsttwo.toString();
              
               //var regEx = new RegExp(leftv, "ig");
             // var replaceMask ='<span style="background-color:yellow">'+leftv+'</span>';
               //this.content = this.content.replace(regEx, replaceMask);
             
                var result= this.content.indexOf(leftv);
                console.log("result==>",result);
                var tempString = this.content.substring(0, result);
                var lineNumber = tempString.split('\n').length;
               
              console.log("line numebr",lineNumber)
            
              
              if(window['CKEDITOR']){
               //alert("jump 2");
            leftv = leftv.replace(/  +/g, ' ');
           setTimeout(function(){ window['CKEDITOR'].tools.callFunction(43,this)},4000);
           setTimeout(function(){ $("#cke_112_textInput").val(leftv.trim()+" "+toi)},5000);
            setTimeout(function(){ $("#cke_111_textInput").val(leftv.trim()+" "+toi)},5000);
           setTimeout(function(){ document.getElementById("cke_119_uiElement").click()},6000);
            setTimeout(function(){ document.getElementById("cke_118_uiElement").click()},6000);
            setTimeout(function(){ document.getElementById("cke_dialog_close_button_107").click() }, 7000);
             setTimeout(function(){ document.getElementById("cke_166_uiElement").click() }, 7000);
             setTimeout(function(){ document.getElementById("cke_dialog_body").click() }, 8000);
        
            }
          }
          
       });
  

  
    
   
    }
      ngOnInit(){

       
    }
 saveDocument(dd)
  {   

       this.content=this.content.replace(new RegExp("'background-color:white'>", 'g'), "");

        console.log("window.location.href",window.location.href)
      var url=window.location.href;

      var editor=window['CKEDITOR'].instances.editor1.getData()
      this.documentotion.data=editor;
      console.log("saveDocument",editor);
      this.documentotion.fileid =  url.split('=')[1]
      this.editorService.saveDocumentData(this.documentotion).subscribe(data => {
            console.log( "data saved" );
        });
  }

  download(){
       var url = this.router.url;
       var id =url.split("=")[1];
       window.location.href = environment.baseUrl+"download-document/"+id+"/";   
  }
 downloadpdf()
  {

    var lMargin=15; //left margin in mm
    var rMargin=15; //right margin in mm
    var pdfInMM=210;  // width of A4 in mm

      var doc = new jsPDF("p","mm","a4");
     doc.setFontSize(12);
      doc.setFontStyle('Arial');

    var specialElementHandlers = {
    '#editor': function (element, renderer) {
        return true;
    }
    };   
 

    this.content=this.content.replace(new RegExp("&ldquo;", 'g'), "");
    this.content=this.content.replace(new RegExp("&rdquo;", 'g'), "");
    this.content=this.content.replace(new RegExp("&rsquo;", 'g'), "");
    this.content=this.content.replace(new RegExp("&trade;", 'g'), "");

     var text=this.content;
     
   
    console.log("=====",text);
    doc.fromHTML(text, 5, 5, {
        'width': 180,
            'elementHandlers': specialElementHandlers
    }, function(bla) {   doc.save('demo.pdf');
      });
    

 }
}
