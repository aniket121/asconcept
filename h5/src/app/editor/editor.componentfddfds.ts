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
var that;
@Component({
  templateUrl: 'editor.component.html'
  
})
export class editorComponent {
public content:any;
public getcontent:any;
public documentotion: any = {};
public test:any;
 constructor(private editorService: editorService,@Inject(DOCUMENT) private document: Document){
   
    }
      ngOnInit(){
       
        var dd=localStorage.getItem("fileid");
         window['CKEDITOR']['replace']( 'editor1' )
           window['CKEDITOR'].config.height = '800px';
         this.editorService.getfileconten(dd).subscribe(data => {
         this.content=data;
         this.content=data[0].fields.file_content;
         
        });
       
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
      var filename = "demo"
    var text = this.content;

    var element = document.createElement('a');
  element.setAttribute('href', 'data:text;charset=utf-8,' + encodeURIComponent(text));
    //element.setAttribute('download', filename);

    element.setAttribute('download', filename+".docx");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

}
