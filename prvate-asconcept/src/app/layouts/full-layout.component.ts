
 import { Component, Input, Output ,  OnInit , EventEmitter } from '@angular/core';
import { LayoutService } from './layouts.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
 import { ModalDirective } from 'ng2-bootstrap/modal/modal.component';
 import { Http, Response, Headers, RequestOptions, RequestMethod } from '@angular/http';
 import {TranslateService, TranslateLoader, TranslateStaticLoader} from 'ng2-translate';
 import * as _ from 'lodash';
@Component({
  selector: 'app-dashboard',
  templateUrl: './full-layout.component.html',
   providers: [LayoutService],
})
export class FullLayoutComponent implements OnInit {
  public browserTitle:string = 'New Concept List';
  public disabled: boolean = false;
  public projectName;
  public username: string;
  public userName: string;
  public stopList: string;
  public project: string;
  public status: {isopen: boolean} = {isopen: false};
  conceptlists: any = {};
  public concept: any = [];
  public textlistfolders: any = [];
  public childData: string ;
  newFolderData: any = {};
  renameFolderData: any = {};
  deleteFolderData: any = {};
  newTextListData: any = {};
  conceptListListData: any = {};
  conceptDeleteData: any = {};
  conceptRenameData: any = {};
  definationData: any = {};
  postsubfolderData: any = {};
  textListFile;
  public masterConcepts:any;
  public termslist:any = [];
   public finaltermlist:any = [];
   public multipleconceptList:any = [];
   public subfoldername:any="ssss";
   public termsarry:any=[];
   public conceptarray:any=[];
   public foldername
   public concept_status:any;
   public loaderFlag:any;
   public loading:boolean = false;
   public Nodes:{};
   public reviewConceptName:any;
   public nodefound:any;
public loader: boolean = false;
   public uploaded: any = [];
   public getstop:any[];
   public conceptListFile: any = [];
   public addstopListFile:any =[];
   public text_folders:any;
   public text_list_data:any;
   public urls:any;
   constructor(private Translate: TranslateService, private router: Router, private UserService: LayoutService,private activeRoute: ActivatedRoute) {
    this.router = router;
    Translate.setDefaultLang("en");
 var lang= localStorage.getItem("lang");
   Translate.use(lang);
   this.concept_status=localStorage.getItem("conceptStatus");
     console.log("conceptstatus",this.concept_status);
   }

  public toggled(open: boolean): void {
    
  }

  public toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }

  ngOnInit(): void {   
 
    this.userName = localStorage.getItem("username");
     this.username = localStorage.getItem("usertype");
     this.project=localStorage.getItem("addproject");
     var pid = localStorage.getItem('projectId');
      this.projectName = localStorage.getItem('projectName');
       
        this.UserService.getmasterlist().subscribe(data => {    
      this.masterConcepts = data  
      console.log("master concept",data); 

  });  

        this.UserService.getKnowledgeNode().subscribe(data => {
          console.log(data);
          this.Nodes=data.nodes;
        
      });
        if(localStorage.getItem("addproject")=="beforeproject")
         {
           this.hide();
         }
         this.UserService.getstoplist().subscribe(data => {
        
          this.getstop=data;
         console.log("stoplist",this.getstop)
        });
         
      this.UserService.getConceptFolder(pid).subscribe(data => {
        this.conceptFolder = data
        console.log(this.conceptFolder)
    });
     this.UserService.getData(pid).subscribe(data => {
      
        this.urls = data.urls;
        this.concept = data.concept_lists;
        console.log("bhin==",data)
        this.text_folders = data.text_folders;
        this.text_list_data = data.text_list_data
        this.textlistfolders=data.text_list_folders;
    });
  }
  
  renameTextListFolder(event){ 
     document.getElementById("renameFolder").click();
     var i =  (<HTMLInputElement>document.getElementById("hiddenId-of")).value;
      var name =  (<HTMLInputElement>document.getElementById("textOfFolder")).value;
       (<HTMLInputElement>document.getElementById("folderRenameId")).value=i;
        (<HTMLInputElement>document.getElementById("folderRenameText")).value=name;

     
    
  }
  deletemultiple()
  {
     document.getElementById("deletemultiple").click();
     var pid=localStorage.getItem("projectId");
     this.UserService.getConceptlist(pid).subscribe(data => {
       console.log("==response==",data);
       this.multipleconceptList=data;
       
    
      });
  }
  getmultipleconceptids(ids:any)
  {
      console.log(this.conceptarray);
      console.log(this.conceptarray.toString());
      this.conceptListListData.concept_id=this.conceptarray.toString();
      this.UserService.deleteMultipleConceptList(this.conceptListListData).subscribe(data => {
       window.location.reload();
       
    
      });

  }
  addNewSubTextList(){ 
    document.getElementById("addTextList").click();
    var i =  (<HTMLInputElement>document.getElementById("hiddenId-ofsubfolder")).value;
     (<HTMLInputElement>document.getElementById("id-hidden-for-new-text-list")).value=i;      
  }
selectconceptvalue(color)
{
  
 console.log("color",color);
  if (this.conceptarray.indexOf(color) === -1) {
    this.conceptarray.push(color);
  }
  else {
    var index = this.conceptarray.indexOf(color);
    this.conceptarray.splice(index, 1)
  }
 

  
 
}
  closem1(){
      document.getElementById("m1").style.display = "none";

  }
   closem3(){
      document.getElementById("m3").style.display = "none";

  }
   closem2(){
      document.getElementById("m2").style.display = "none";
  }

  closeM5(){
     document.getElementById("m5").style.display = "none";
  }
  closeMM9(){
     document.getElementById("mm9").style.display = "none";
  }
  closem4(){
      document.getElementById("m4").style.display = "none";
  }

  closeStopList(){
      document.getElementById("m10").style.display = "none";
  }

  closeStopListChild(){
      document.getElementById("m11").style.display = "none";
  }

  renameFolder(){
     var text =  (<HTMLInputElement>document.getElementById("folderRenameText")).value;
     var id =  (<HTMLInputElement>document.getElementById("folderRenameId")).value;
     
       if(text.length<=12)  
      {
      this.renameFolderData.folder_name=text;
      this.UserService.renameFolder(id,this.renameFolderData).subscribe(data => {
        setTimeout(function(){ 

             location.reload();
           },1000);
      });
     }
      else
      {
         alert("A folder name must be less than 12 characters")
      }
    

  }

  addNewTextList(){ 
    document.getElementById("addTextList").click();
    var i =  (<HTMLInputElement>document.getElementById("hiddenId-of")).value;
     (<HTMLInputElement>document.getElementById("id-hidden-for-new-text-list")).value=i; 
     
  }
  openlimit()
  {
    
    document.getElementById("limit").click();
  }
  setlimit(limit)
  {
     console.log(limit)
    localStorage.removeItem("setlimit");
    localStorage.setItem("setlimit",limit);
    window.location.reload();
  }

userComment(conceptId)
{

document.getElementById("defination").click();

 var id=  (<HTMLInputElement>document.getElementById("conceptid")).value;
 
this.UserService.getDefination(id).subscribe(data => {
        console.log("response==>",data);
        console.log("response===>",data[0].fields.defination);
        
      (<HTMLInputElement>document.getElementById("def")).value=data[0].fields.defination; 
      });

}
saveDef(def)
{
    

    
    console.log(def);
    var id=  (<HTMLInputElement>document.getElementById("conceptid")).value;
    console.log(id);
    this.definationData.id=id;
    this.definationData.def=def;
    console.log("=========",this.definationData)
    this.UserService.addDefination(this.definationData).subscribe(data => {
       console.log("==response==",data)
       window.location.reload()
      });

}
  public fileChangeEvent(event){
        let fileList: FileList = event.target.files;
       var data = [];
       for(var i=0;i<fileList.length;i++){
         let file: File = fileList[i];
         data[i] = (fileList[i]);
         if(data[i].size>1024000)
          {
            alert("Document size should be less than 1MB. Please compress Document by Clicking on 'Compress Files' link")
            window.location.reload()

          }
          var lengthOftheFile=data[i].name.length;
          var reducewiththree=data[i].name.length - 3;
          var pdfExtension=data[i].name.substring(reducewiththree, lengthOftheFile);
          if(pdfExtension =="pdf")
          {
              
           alert("Please convert pdf file to docx file by Clicking on the 'PDF to DOCX' link")
            window.location.reload()

          }
         
          
       }
       this.uploaded = data;
       
  }

  fileChangeEvent2(event){
      let fileList: FileList = event.target.files;
      let file: File = fileList[0];
      this.conceptListFile = fileList[0];
  }



   addTextList(){
      this.loaderFlag = 'loader';
      var x =  (<HTMLInputElement>document.getElementById("newTextListFile")).value;
      var id =  (<HTMLInputElement>document.getElementById("id-hidden-for-new-text-list")).value;
     var minLegth=(this.uploaded).length;
     if(minLegth<=10)
     {
     var access_token=localStorage.getItem("access_token");
     this.loading=true;
     this.UserService.addNewTextList(localStorage.getItem('userId'),localStorage.getItem('projectId'),id,access_token,this.uploaded).subscribe(data => {
      setTimeout(function(){ 
             location.reload();
           },1000);
      }); 
     }
      else
      {
         alert("You may upload a maximum of 10 documents at a time");
          setTimeout(function(){ 

             location.reload();
           },100);
      }


  }
  public conceptlistfolderId:any;
  newConceptListImport(){ 
    this.conceptlistfolderId =  (<HTMLInputElement>document.getElementById("hiddenId-of-concept-list-folder-id")).value;
    document.getElementById("addConceptList").click();
  }
  newConceptStopListImport(){
    document.getElementById("addConceptStopList").click();    
  }


  addConceptList(){
        this.loader=true;
        this.loaderFlag = 'loader';
        this.UserService.addNewConceptList( this.conceptlistfolderId,this.conceptListFile).subscribe(data => {
          console.log(data);
          if(data.success=='alert')
          {
            alert("A concept list may contain a maximum of 200 concepts. Any list with more than 200 will be cut short.")
          }
          if(data.success=="false")
          {
             
             alert("A concept list with the same name as an existing one cannot be uploaded")
          }
        setTimeout(function(){ 

             location.reload();
           },100);
      }); 
  }

  fileChangeEventStopList(event){
   
          let fileList: FileList = event.target.files;
          let file: File = fileList[0];
          this.addstopListFile = fileList[0];
           console.log("===============event  event===",this.addstopListFile)
            console.log("===============event  event===")
  }
  addStopList(){
    console.log("===============addstopListFile===",this.addstopListFile)
        this.loader=true;
        this.UserService.addNewStopList( this.addstopListFile).subscribe(data => {
          console.log(data);
        setTimeout(function(){ 
             location.reload();
           },100);
      }); 
  }


  hide(){
  
   document.getElementById("toglerbtn").click();
   document.getElementById("toglerbtn").style.display = "none";

  }

  showConceptListMenu(event){
       document.getElementById("m4").style.display = "block";
       
       var target = event.target || event.srcElement || event.currentTarget;
        var name = target.id.substring(0, target.id.indexOf('@')); 
      var id  = target.id.substring(target.id.indexOf("@") + 1);
        (<HTMLInputElement>document.getElementById("hiddenId-of-concept-list")).value=id;
       (<HTMLInputElement>document.getElementById("textOfConceptList")).value=name;

    return false;
  }

  logout()
  {
   localStorage.clear();
  }
  ConceptListMenuChild(event,child){
    
      this.childData = child
      document.getElementById("mm9").style.display = "block";
      var target = event.target || event.srcElement || event.currentTarget;
      var name = target.id.substring(0, target.id.indexOf('@')); 
      var id  = target.id.substring(target.id.indexOf("@") + 1);
      (<HTMLInputElement>document.getElementById("hidenTermsOfUmbrellaChild")).value=id;
      (<HTMLInputElement>document.getElementById("hidenUmbrellaChild")).value=name;
    return false;
  }

ConceptStopListMenu(event){
      //this.stopList = stopList
      this.browserTitle ="New Stop list";
      document.getElementById("m10").style.display = "block";
    return false;

}

ConceptStopListMenuChild(event){
      document.getElementById("m11").style.display = "block";  
      var target = event.target || event.srcElement || event.currentTarget;
      var name = target.id.substring(0, target.id.indexOf('@')); 
      var id  = target.id.substring(target.id.indexOf("@") + 1);

      (<HTMLInputElement>document.getElementById("hiddenId-of-stop-list")).value=id;
      (<HTMLInputElement>document.getElementById("textOfStopList")).value=name;
    return false;
}


  
 demo1(){
    document.getElementById("m1").style.display = "block";
    
    return false;
 }

  demo2(){
     
     document.getElementById("m2").style.display = "block";
 
  
    return false;
 }

  
    demo3(event){
   
      document.getElementById("m3").style.display = "block";
 
     var target = event.target || event.srcElement || event.currentTarget;
       
      var id = target.id.substring(0, target.id.indexOf('@')); 
      var name  = target.id.substring(target.id.indexOf("@") + 1);

      (<HTMLInputElement>document.getElementById("hiddenId-of")).value=id;
       (<HTMLInputElement>document.getElementById("textOfFolder")).value=name;
    return false;
 }

addNewFolderToTextList(){

    document.getElementById("uniq").click();

}
createNewFolder(){ 
      this.newFolderData.folder_name = (<HTMLInputElement>document.getElementById("text-list-new-folder-name")).value;
    
      var minLength=(<HTMLInputElement>document.getElementById("text-list-new-folder-name")).value.length;
       if(minLength<15){
      this.UserService.addFolder( this.newFolderData, localStorage.getItem("userId"), localStorage.getItem("projectId")).subscribe(data => {
            setTimeout(function(){ 

             location.reload();
           },1000);

        });
    }
    else
    {
          alert("Folder Name should be less than 15 char")
    }

}

deleteTextListFolder(){  
   document.getElementById("deleteFolder").click();
   var i =  (<HTMLInputElement>document.getElementById("hiddenId-of")).value;
       (<HTMLInputElement>document.getElementById("folderDeleteId")).value=i;
}



deleteFolder(){

      var id =  (<HTMLInputElement>document.getElementById("folderDeleteId")).value;
      
      
      this.UserService.deleteFolder(id,this.deleteFolderData).subscribe(data => {
        setTimeout(function(){ 

             location.reload();
           },1000);
      });
    

}  

showConceptListMenuUmbrella(event){ 
   

      var target = event.target || event.srcElement || event.currentTarget;
      
      console.log("====target===",target)       
      var umbrella = target.id.substring(0, target.id.indexOf('@')); 
     var termsraw = target.id.substring(target.id.indexOf("@") + 1);
     var termlen=termsraw.length;
     var termdiff=termlen-5
     var terms=termsraw.substring(0,termdiff);

     var conceptid = target.id.substring(target.id.indexOf("@")); 
     var splitstr=conceptid.split("@");
     var updatedterms=splitstr[splitstr.length-2]
     var conceptidvar=splitstr[splitstr.length-1];
     
      (<HTMLInputElement>document.getElementById("hidenTermsOfUmbrella")).value=updatedterms;
(<HTMLInputElement>document.getElementById("hidenUmbrella")).value= umbrella;
         (<HTMLInputElement>document.getElementById("conceptid")).value= conceptidvar;
          document.getElementById("m5").style.display = "block";
          return false;
}

insertIntosearch(){

     var terms =  (<HTMLInputElement>document.getElementById("hidenTermsOfUmbrella")).value;
     var umbrella = (<HTMLInputElement>document.getElementById("hidenUmbrella")).value;
     (<HTMLInputElement>document.getElementById("lst_toi")).value=terms;
     (<HTMLInputElement>document.getElementById("lst_toi1")).value=umbrella;
}
selectTerms()
{  
   this.termslist=[];
   document.getElementById("terms").click();
   //termsvalue
   var container = document.getElementById("termsvalue");
   var terms =  (<HTMLInputElement>document.getElementById("hidenTermsOfUmbrella")).value;
    var temp = new Array();
    temp = terms.split(",");
     this.termslist.push(temp)
     this.finaltermlist=this.termslist[0];
    
     console.log("this.finaltermlist",this.finaltermlist)}
selecttermsvalue(color)
{
  
 console.log("color",color);
  if (this.termsarry.indexOf(color) === -1) {
    this.termsarry.push(color);
  }
  else {
    var index = this.termsarry.indexOf(color);
    this.termsarry.splice(index, 1)
  }
 
 console.log("selected terms=======>",this.termsarry);
  
 
}
insertTerms()
{
   console.log("insertTerms=======>",this.termsarry);

  (<HTMLInputElement>document.getElementById("lst_toi")).value=this.termsarry;
  (<HTMLInputElement>document.getElementById("lst_toi1")).value=this.termsarry;
}


insertIntosearchChild(){
  
     (<HTMLInputElement>document.getElementById("lst_toi")).value=this.childData;
     (<HTMLInputElement>document.getElementById("lst_toi1")).value=this.childData;
}

ConceptListMenuStopList(){

}

insertintoand(){
    var terms =  (<HTMLInputElement>document.getElementById("hidenTermsOfUmbrella")).value;
     (<HTMLInputElement>document.getElementById("and")).value=this.childData;
}
renameConceptList(){
  document.getElementById("renameConceptList").click();
   var i =  (<HTMLInputElement>document.getElementById("hiddenId-of-concept-list")).value;
   
   var name =  (<HTMLInputElement>document.getElementById("textOfConceptList")).value;


       (<HTMLInputElement>document.getElementById("pop-up-concpt-id")).value=i;
    (<HTMLInputElement>document.getElementById("pop-up-concept-name")).value=name;
    // conceptRenameData
}


renameeConceptList(){
    var id = (<HTMLInputElement>document.getElementById("pop-up-concpt-id")).value;
    var name = (<HTMLInputElement>document.getElementById("pop-up-concept-name")).value;
    this.conceptRenameData.concept_id=id;
     this.conceptRenameData.rename_list=name;
     this.UserService.renameConceptList(  this.conceptRenameData).subscribe(data => {
        setTimeout(function(){ 
             location.reload();
           },1000);
      });
}

deleteConceptList(){
   document.getElementById("deleteConceptList").click();
   var i =  (<HTMLInputElement>document.getElementById("hiddenId-of-concept-list")).value;
   var name =  (<HTMLInputElement>document.getElementById("textOfConceptList")).value;
    (<HTMLInputElement>document.getElementById("delete-concept-list-hidden-pop")).value=i;
}
deleteeConceptList(){
  this.conceptDeleteData.concept_id =  (<HTMLInputElement>document.getElementById("delete-concept-list-hidden-pop")).value;
  this.UserService.deleteConceptList(  this.conceptDeleteData ).subscribe(data => {
        setTimeout(function(){ 

             location.reload();
           },1000);
      });
}



renameStopList(){ 
   document.getElementById("renameStopList").click();
   var id =  (<HTMLInputElement>document.getElementById("hiddenId-of-stop-list")).value;   
   var name =  (<HTMLInputElement>document.getElementById("textOfStopList")).value;

       (<HTMLInputElement>document.getElementById("pop-up-stop-id")).value=id;
    (<HTMLInputElement>document.getElementById("pop-up-stop-name")).value=name;

}


renameGivenStopList(){  
    var id = (<HTMLInputElement>document.getElementById("pop-up-stop-id")).value;
    var name = (<HTMLInputElement>document.getElementById("pop-up-stop-name")).value;
 
    var data = {
      'id' : id,
      'name':name, 
    };
     this.UserService.renameStopList(data).subscribe(data => {
        setTimeout(function(){ 
             location.reload();
           },1000);
      });
}

public deletStopListId:any;
deleteStopList(deletestopListId){
  this.deletStopListId = deletestopListId
  document.getElementById("deleteStopList").click();
  
}
deletedStopList(){
  this.UserService.deleteStopList( this.deletStopListId ).subscribe(data => {
        setTimeout(function(){ 

             location.reload();
           },1000);
      });
}



allClose(){
 /*
  document.getElementById("m1").style.display = "none";
  document.getElementById("m3").style.display = "none";
   document.getElementById("m2").style.display = "none";
    document.getElementById("m4").style.display = "none";
     document.getElementById("m5").style.display = "none";
   */
   console.log("in all close");
   $("#m1").css("display","none");
   $("#m2").css("display","none");
    $("#p1").css("display","none");
   $("#m3").css("display","none");
   $("#m4").css("display","none");
   $("#m5").css("display","none");
    $("#m11").css("display","none");
   
      $("#m10").css("display","none");
      $("#mm5").css("display","none");
      $("#mm3").css("display","none");    
      $("#masterChileId").css("display","none");
      $("#masterlist").css("display","none");
      $("#mm9").css("display","none");
      $("#url_menu").css("display","none");
      $("#gotoknowledge").css("display","none");

    
}
newQueryPgae()
{
   var url=localStorage.getItem("url");
  
   console.log("navigate to project",url);
   window.location.href=url;
  setTimeout(function(){ window.location.reload() }, 15);
}
  TextListMenuChild(event,child){ 
    
      document.getElementById("p1").style.display = "block";
      var target = event.target || event.srcElement || event.currentTarget;
      console.log(target,"------------")   
      var name = target.id.substring(0, target.id.indexOf('@')); 
      var id  = target.id.substring(target.id.indexOf("@") + 1);
      console.log("name",name);
         console.log("id",id);
      (<HTMLInputElement>document.getElementById("hiddenId-of-text-list")).value=id;
      (<HTMLInputElement>document.getElementById("textListId")).value=name;
    return false;
  }
public deletTextListId:any;
deleteTextListData(){
 
   document.getElementById("deleteTextList").click();
   var i =  (<HTMLInputElement>document.getElementById("hiddenId-of-text-list")).value;
   var name =  (<HTMLInputElement>document.getElementById("textListId")).value;  
   (<HTMLInputElement>document.getElementById("delete-text-list-hidden-pop")).value=i;
}

deleteeTextList(){
  var dataId =  (<HTMLInputElement>document.getElementById("hiddenId-of-text-list")).value;
  console.log("id===>",dataId);
  var data = {'id' : dataId};
  this.UserService.deleteTextList( data ).subscribe(data => {
        setTimeout(function(){ 
             location.reload();
           },1000);
      });
}
closeTxtList()
{
    document.getElementById("p1").style.display = "none";
}
addSubfolder()
{
   document.getElementById("subfolder").click();
   var i =  (<HTMLInputElement>document.getElementById("hiddenId-of")).value;
     (<HTMLInputElement>document.getElementById("hiddenfolderId")).value=i;
}
addsub()
{
    var id=((<HTMLInputElement>document.getElementById("hiddenfolderId")).value);
    console.log(id);
    var name=((<HTMLInputElement>document.getElementById("sub")).value);
    
    this.postsubfolderData.folder_name=name;
    this.postsubfolderData.folder_id=id;
    console.log(this.postsubfolderData);
    if(name.length<=12)
    {
    this.UserService.addsubFolder(localStorage.getItem("userId"), localStorage.getItem("projectId"),this.postsubfolderData).subscribe(data => {
            setTimeout(function(){ 

             location.reload();
           },1000);

        });
   }
   else{
        alert("A folder name must be less than 12 characters")
      }

}
addNewFolderToConceptList(){
    document.getElementById("clist").click();
}
public conceptFolder:any;
demos3(event){
    document.getElementById("mm3").style.display = "block";
    var target = event.target || event.srcElement || event.currentTarget;       
    var id = target.id.substring(0, target.id.indexOf('@')); 
    var name  = target.id.substring(target.id.indexOf("@") + 1);
    (<HTMLInputElement>document.getElementById("hiddenId-ofsubfolder")).value=id;
    (<HTMLInputElement>document.getElementById("textOfsubFolder")).value=name;
    return false;
 }

demo4(event){
    document.getElementById("mm5").style.display = "block";
    var target = event.target || event.srcElement || event.currentTarget;       
    var id = target.id.substring(0, target.id.indexOf('@')); 
    var name  = target.id.substring(target.id.indexOf("@") + 1);
    (<HTMLInputElement>document.getElementById("hiddenId-of-concept-list-folder-id")).value=id;
    (<HTMLInputElement>document.getElementById("textOfConceptListFolder")).value=name;
    return false;
 }
 createNewFolderConceptList(){ 
      var name = (<HTMLInputElement>document.getElementById("concept-list-new-folder-name")).value;  
      var data = {'name' : name}; 
      this.UserService.addConceptFolder( data, localStorage.getItem("userId"), localStorage.getItem("projectId")).subscribe(data => {

            setTimeout(function(){ 
             location.reload();
           },1000);
      });
}
renameConceptListFolder(event){ 
     document.getElementById("renameConceptFolder").click();
     var i =  (<HTMLInputElement>document.getElementById("hiddenId-of-concept-list-folder-id")).value;
      var name =  (<HTMLInputElement>document.getElementById("textOfConceptListFolder")).value;
       (<HTMLInputElement>document.getElementById("folderRenameConceptId")).value=i;
        (<HTMLInputElement>document.getElementById("folderRenameConceptText")).value=name;
  }


  public deleteConceptFolderId:any;
deleteConceptListFolder(){  
   document.getElementById("deleteConceptFolder").click();
   this.deleteConceptFolderId=  (<HTMLInputElement>document.getElementById("hiddenId-of-concept-list-folder-id")).value;
   (<HTMLInputElement>document.getElementById("textOfConceptListFolder")).value= this.deleteConceptFolderId;
}

  renameFolderConcept(){
     var text =  (<HTMLInputElement>document.getElementById("folderRenameConceptText")).value;
     var id =  (<HTMLInputElement>document.getElementById("folderRenameConceptId")).value;
     this.UserService.renameFolderConcept(id,{'name' : text}).subscribe(data => {
     setTimeout(function(){ 
            location.reload();
          },1000);
     });
  }
  deleteConceptFolder(){
      this.UserService.deleteConceptFolder({'id': this.deleteConceptFolderId}).subscribe(data => {
        setTimeout(function(){ 
             location.reload();
           },1000);
      });
} 
deleteSubTextListFolder(){  
   document.getElementById("deleteFolder").click();
   var i =  (<HTMLInputElement>document.getElementById("hiddenId-ofsubfolder")).value;
       (<HTMLInputElement>document.getElementById("folderDeleteId")).value=i;
}
 renameSubTextListFolder(event){ 
     document.getElementById("renameFolder").click();
     var i =  (<HTMLInputElement>document.getElementById("hiddenId-ofsubfolder")).value;
      var name =  (<HTMLInputElement>document.getElementById("textOfsubFolder")).value;
       (<HTMLInputElement>document.getElementById("folderRenameId")).value=i;
        (<HTMLInputElement>document.getElementById("folderRenameText")).value=name;
  }
  importUrl(){
   document.getElementById("addurl").click();
   var i =  (<HTMLInputElement>document.getElementById("hiddenId-of")).value;
     (<HTMLInputElement>document.getElementById("hiddenurlId")).value=i;
}
addUrl(){
    var data = {};
    data['name'] = ((<HTMLInputElement>document.getElementById("urlname")).value);
    data['url']  = ((<HTMLInputElement>document.getElementById("url")).value);
    data['folder_id'] =  (<HTMLInputElement>document.getElementById("hiddenId-of")).value;
    console.log("addurl===>",data);
    this.UserService.addUrl(localStorage.getItem("projectId"),data).subscribe(data => {
         location.reload();
    });
}
TextListUrl(event,data){ 
      console.log(data)
      document.getElementById("url_menu").style.display = "block";
      var target = event.target || event.srcElement || event.currentTarget; 
      var name = target.id.substring(0, target.id.indexOf('@')); 
      
      (<HTMLInputElement>document.getElementById("hiddenId-of-text-list-url")).value = data;
      (<HTMLInputElement>document.getElementById("textListurlId")).value = name;
      return false;
  }
  public deleteUrlId:any;
deleteTextListUrl(){
   document.getElementById("delete-text-listurl").click();
   var i =  (<HTMLInputElement>document.getElementById("hiddenId-of-text-list-url")).value;
   var name =  (<HTMLInputElement>document.getElementById("textListurlId")).value;  
  
   (<HTMLInputElement>document.getElementById("delete-text-list-url")).value=i;
}   
deleteUrl(){
  var dataId =  (<HTMLInputElement>document.getElementById("delete-text-list-url")).value;
  var data = {'id' : dataId};
  this.UserService.deleteURL(  data ).subscribe(data => {
      location.reload();
      }); 
 }
closeurl()
{
  document.getElementById("url_menu").style.display = "none";
}
deleteeMasterList(){
  var dataId =  (<HTMLInputElement>document.getElementById("delete-master-list-hidden-pop")).value;  

  
  this.UserService.deleteMasterList(dataId).subscribe(data => {
             location.reload();
      });
}


renameGivenMasterList(){  
    var id = (<HTMLInputElement>document.getElementById("pop-up-master-id")).value;
    var name = (<HTMLInputElement>document.getElementById("pop-up-master-name")).value;
 
    var data = {
      'id' : id,
      'name':name, 
    };
     this.UserService.renameMasterList(data).subscribe(data => {
        setTimeout(function(){ 
             location.reload();
           },1000);
      });
}


public masterList:any ;
  fileChangeEventMasterList(event){ 
    console.log(event.target.files); 
          let fileList: FileList = event.target.files;
          let file: File = fileList[0];
          this.masterList = fileList[0];
 }


  addMasterList(){
    console.log("===============addMasterListFile===",this.masterList)
       
        this.loaderFlag = 'loader';
        this.UserService.addNewMasterList( this.masterList).subscribe(data => {
          console.log(data);
        setTimeout(function(){ 
             location.reload();
           },100);
      }); 
  }


showMasterList(event){
      //this.stopList = stopList
     this.browserTitle ="New Master Concept List";
      document.getElementById("masterlist").style.display = "block";
    return false;
}



 newMasterListImport(){
    document.getElementById("addMasterList").click();    
}

renameMasterList(){ 
   document.getElementById("myModalMaster").click();
   var id =  (<HTMLInputElement>document.getElementById("hiddenId-of-master-list")).value;   
   var name= '';
   for(var i in this.masterConcepts){
     console.log(this.masterConcepts[i]['name'])
     if(Number(this.masterConcepts[i]['id']) == Number(id) ){
        name = this.masterConcepts[i]['name']
        break;
     }
   }
    (<HTMLInputElement>document.getElementById("pop-up-master-id")).value   = id;
    (<HTMLInputElement>document.getElementById("pop-up-master-name")).value = name;
}



public deleteMasterListId:any;
deleteMasterList(deleteMasterListId){
  this.deleteMasterListId = deleteMasterListId
  document.getElementById("deleteMasterList").click();
  var i =  (<HTMLInputElement>document.getElementById("hiddenId-of-master-list")).value;
  var name =  (<HTMLInputElement>document.getElementById("textOfMasterList")).value;  
  (<HTMLInputElement>document.getElementById("delete-master-list-hidden-pop")).value=i;
}

  closemasterChild()
  {
     document.getElementById("masterlist").style.display = "none";
   }
MasterListMenuChild(event){
      document.getElementById("masterChileId").style.display = "block";  
      var target = event.target || event.srcElement || event.currentTarget;
      var name = target.id.substring(0, target.id.indexOf('@')); 
      var id  = target.id.substring(target.id.indexOf("@") + 1);
      (<HTMLInputElement>document.getElementById("hiddenId-of-master-list")).value=id;
      (<HTMLInputElement>document.getElementById("textOfMasterList")).value=name;
    return false;
}
gotoKnowledge(){
     var reviewConceptName=$("#hidenUmbrella").val();
     
     var nodefound=false;
   _.filter(this.Nodes, function(Node) {
    if(Node.class ==="Playbook" && Node.props._oid){
         
         console.log("props",Node.props.name.toUpperCase())

        if((reviewConceptName.toUpperCase()).trim()==Node.props.name.toUpperCase())
        {
           nodefound=false;
           
           window.open("https://mattersmith1.embeddedexperience.com/#playbook_openOid="+Node.props._oid+"&filter_includeManual="+Node.props._oid+"&select="+Node.props._oid+"&v=1&path="+Node.props.attachment)
           

        }
        else{
           nodefound=true;
        }
        if(nodefound!=true){
          this.ngOnInit()
        }
    }
    
});
if(nodefound && true){
 document.getElementById("cancelModalConcept").click();
}

}






} 
