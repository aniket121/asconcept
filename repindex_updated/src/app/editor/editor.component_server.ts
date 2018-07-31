import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { editorService } from './editor.service';
import { DOCUMENT } from '@angular/platform-browser';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Observable, Subject } from 'rxjs/Rx';
import { Inject} from "@angular/core";
import * as _ from "lodash";
declare var $: any;
declare var CKEDITOR: any;


@Component({
  templateUrl: 'editor.component.html'
  
})
export class editorComponent {
public content:any;
public getcontent:any;
public documentotion: any = {};
public tempData:any;
public test:any;
 constructor(private editorService: editorService,@Inject(DOCUMENT) private document: Document){

            var dd=localStorage.getItem("fileid");
            this.editorService.getfileconten(dd).subscribe(data => {
            this.content = data[0].fields.file_content;
         
            var dd=localStorage.getItem("fileid");
            window['CKEDITOR']['replace']( 'editor1' )
            window['CKEDITOR'].config.height = '800px';
             window['CKEDITOR'].config.allowedContent =true;

            var left=localStorage.getItem("left");
            var right=localStorage.getItem("right");
            var toi=localStorage.getItem("toi");
            //this.content=this.content.replace(new RegExp("yellow", 'g'), "white") 

            var t = left.split(" ");
            var  lasttwo=t[t.length - 4]+" " +t[t.length - 3] + " "+ t[t.length - 2] + t[t.length - 1];
            var tmp=lasttwo;
            var t1 = right.split(" ");
            var firsttwo=t1[0]+" "+t1[1]+" "+t1[2]+" "+t1[3];

            var len=lasttwo.split(" ")
            var len1=firsttwo.split(" ")

          //this.content=this.content.replace(new RegExp('< ="background-color:white">', 'g'), "aniket");
          //this.content=this.content.replace(new RegExp('<span style="background-color:yellow">circumstances</span>', 'g'), "circumstances");
            if(len.length >2 && len1.length>2 ){
              console.log("===1===");
              var sent=left+toi+right
              var sentence=sent.toString();
              var rightv=firsttwo.toString();
              console.log("sentence",toi+rightv)
              this.content = this.content.replace(new RegExp('<span style="background-color:white">'+toi+'</span>', 'g'), toi);    
              var regEx = new RegExp(toi+rightv, "ig");
              var replaceMask ='<span style="background-color:yellow">'+toi+'</span>'+rightv;
                  
              this.content = this.content.replace(regEx, replaceMask);

              var leftv=lasttwo.toString();
              var result= this.content.indexOf(rightv);
              if(result==-1){
                result= this.content.indexOf(leftv);
              }

              var tempString = this.content.substring(0, result);
              var lineNumber = tempString.split('\n').length;

              setTimeout(function(){console.log(window['CKEDITOR'].instances.editor1.document.$);
                    var exmaple=$(window['CKEDITOR'].instances.editor1.document.$);      
                    var documentHeight = exmaple.height();      
                      if(documentHeight<3000){
                        exmaple.scrollTop(lineNumber*22);
                      }else if(documentHeight>13000){
                          var newline=lineNumber+8
                          exmaple.scrollTop(newline*27);
                      }
	 	                else if(documentHeight>7000)
	                	 {
  		              	 var newline=lineNumber+6;
			                  exmaple.scrollTop(newline*18);
 		                 }
              }, 2000);
          } else{
                
                  console.log("=====2=====")
                  //this.content = this.content.replace(new RegExp(toi, 'g'), "");
                  var leftv=lasttwo.toString();
                  var toistr=toi.toString();
                  var searchsentence=leftv+toistr;
                   this.content = this.content.replace(leftv,leftv+" "+'<span style="background-color:yellow">'+toi+'</span>');
                   
                var result= this.content.indexOf(rightv);
                if(result==-1)
                {
                   result= this.content.indexOf(leftv);
                }
                console.log("result==>",result);
                var tempString = this.content.substring(0, result);
             var lineNumber = tempString.split('\n').length;
            // var lineNumber = tempString.split('<br>').length;
              console.log("line numebr",lineNumber)
             // alert(lineNumber);
              setTimeout(function(){console.log(window['CKEDITOR'].instances.editor1.document.$);
            var exmaple=$(window['CKEDITOR'].instances.editor1.document.$);
            console.log("scrolling",exmaple);
            var documentHeight = exmaple.height();
            //alert(documentHeight);
            if(documentHeight<3000)
            {
              console.log("<3000 lenth");
            exmaple.scrollTop(lineNumber*22);
            }
            else if(documentHeight>13000)
            {
                 console.log(">13000 lenth")
                var newline=lineNumber+8
                exmaple.scrollTop(newline*27);
            }
           }, 2000);
          }
          
       });
  

  
    
   
    }
      ngOnInit(){

       
    }
 saveDocument(dd)
  {   


      console.log("window.location.href",window.location.href)
      var url=window.location.href;
      var file1=url.charAt( url.length - 1)
      var file2=url.charAt( url.length - 2)
      var editor=window['CKEDITOR'].instances.editor1.getData()
      console.log("==========edior data",editor);
      var fileid=11;
   


      this.documentotion.data=editor;
      this.documentotion.fileid=file2+file1;
      console.log("data api",this.documentotion);
      this.editorService.saveDocumentData(this.documentotion).subscribe(data => {
         
            console.log( "data saved" );
          
        });
     console.log("save-----");

  }
  download()
  {
     console.log("download......");
     this.content=this.content.replace(new RegExp("yellow", 'g'), "white")
      var filename = "demo"
    var text = this.content;

    var element = document.createElement('a');
     element.setAttribute('href', 'data:application/msword,' + encodeURIComponent(text));
    //element.setAttribute('download', filename);

    element.setAttribute('download', filename+".doc");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

}

