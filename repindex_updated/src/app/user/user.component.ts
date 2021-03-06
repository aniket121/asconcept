 import { Component, Input, Output ,  OnInit , EventEmitter } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/modal/modal.component';
import { repindexService } from '../repindex.service';
 import { UserService } from './user.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { saveAs } from 'file-saver';
import {TranslateService, TranslateLoader, TranslateStaticLoader} from 'ng2-translate';


declare var $: any;
@Component({
    selector: 'child-comp',
  templateUrl: './user.component.html',
   
  
})


export class UserComponent implements OnInit{
   
  selectedCity:any="Concordance";
  querytype:any="local";
  projectData: any = {};
  conscurdance: any = {};
  deletefilesid: any = {};
  clusterdata: any = {};
  textdata: any = [];
  docId: any = [];
  getRangeValue: any = {};
  fileNme:any;
  valueList:any;
  rangeStatus:boolean=false;
  concordanceObject :any=[];
  public textliststatus :boolean=false;
  public constatus: boolean = true;
  public ids:string;
  public self: boolean = false;
  public cluster: boolean = false;
  projectName;
  public categoryTable: any;
  public showTable: boolean = false;
  public selected_ids:any;
  public txt_toi:any;
  public getconcept:any=[];
  public selfcon:any={};
  public getstop:any[];
  public freq: boolean = false;
  public frquecnycount: boolean = false;
  public frequncy:any={};
  public getlimit;
  public lang:any='en';
  public stoplist_status:any;
  public NotFound:any;
  public text_folders:any;
  public concept:any;
  public text_list_data:any;
  public textlistfolders:any;
  public text_list_ref_data:any;
  public text_list_cmp_data:any;
  public currentState:boolean = false;
  public folderRefRecords:any ;
  public urlsData:any;
  public url_info:any;
  public currentCmpState:boolean = false; 
  public folderCmpRecords:any ;
  public urlsCmpData:any;
  public allDocumentCount:any ={}; 
  public documentKeys:any = {};
  public documentComparision:any; 
  public selectedUrlIds:any=[];
  public selectedIds:any = [];
  public selectedUrlCmpIds:any=[];
  public selectedCmpIds:any = [];
  public urls_data:any;
  public url_cmp_info:any;
  public document_comparison:boolean=false;
   public document_count: boolean = false;
   public textId:any;
  public conceptDefault:any;
  public loadingStatus:boolean=false;


 constructor(private Translate: TranslateService, private router: Router, private UserService: UserService,private activeRoute: ActivatedRoute) {
 this.router=router;
 Translate.setDefaultLang("en");
 var lang= localStorage.getItem("lang");
   Translate.use(lang);
   this.lang=lang
   
}

ngOnInit(): void {
           
            this.getlimit=localStorage.getItem("setlimit");
           this.UserService.getstoplist().subscribe(data => {
        $(document).ready(function(){
      console.log("app intialisg........");
        $('[data-toggle="tooltip"]').tooltip(); 
}); 
          this.getstop=data;
         console.log("stoplist====>",this.getstop)
        });
        this.text_folders = '';
        var pro_id=localStorage.getItem('projectId'); 
       this.UserService.getData(pro_id).subscribe(data => {
          this.concept = data.concept_lists;
          this.text_folders = data.text_folders;
          this.text_list_data = data.text_list_data
          this.textlistfolders=data.text_list_folders;   
          this.text_list_ref_data = JSON.parse(JSON.stringify( data.text_list_data ));
          this.text_list_cmp_data = JSON.parse(JSON.stringify( data.text_list_data ));

          this.text_list_data = data.text_list_data
          this.textlistfolders = data.text_list_folders;    
       });
          localStorage.setItem("url",window.location.href );
         localStorage.setItem("type","concordance")
         localStorage.removeItem("conceptlist");
        localStorage.removeItem("selectedids");
        this.activeRoute.queryParams.subscribe((params: Params) => {
        var that = this;       
        var  projectId = params['projectId'];
         localStorage.setItem('projectId',projectId );  
        localStorage.setItem('projectName', params['project']);  
         
           if( localStorage.getItem("counter")=="0"){
          this.hello();
          }
          
       localStorage["counter"] = "1";
           var dd=localStorage.getItem('projectId');  
           this.UserService.gettextlist(dd).subscribe(data => {
           this.textdata=data;
         
        
      
         
           console.log( "textdata",this.textdata );
        });

         this.UserService.getconcept(projectId).subscribe(data => {
        
          this.getconcept=data;
          console.log("this.getconcept",this.getconcept)
        });
          
          
      }) 
        this.stoplist_status=localStorage.getItem("stoplist_status");
      
  }

  hello(){
       location.reload();
       
  }
  sort(){ 

    if(this.sortstate === false){
      var arr = []
      for(var p in this.concordanceObject){
        arr.push(this.concordanceObject[p])
      }
      var count = arr.slice(0);
      count.sort(function(a,b) {
          var x = a.term.toLowerCase();
          var y = b.term.toLowerCase();
          return x < y ? -1 : x > y ? 1 : 0;
      });    
      this.concordanceObject = count
      this.sortstate = true;
    }else{
      this.concordanceObject.reverse();
      this.sortstate = false;
    }
    this.orderstate = false;

  }

  public sortstate:boolean = false;
  public orderstate:boolean =false;
  public originalData:any;

  order(){
    if(this.orderstate === false){
      var arr = []
      for(var p in this.concordanceObject){
        arr.push(this.concordanceObject[p])
      }
      var count = arr.slice(0);
      count.sort(function(a,b) {
          return a.count - b.count;
      });    
      this.concordanceObject = count
      this.orderstate = true;
    }else{
      this.concordanceObject.reverse();
      this.orderstate = false;
    }
    this.sortstate = false;

  }

  delteMultiple()
  {
     var filesid=localStorage.getItem("selectedids");
     if(filesid)
     {
     var isConfirmed = confirm("Are you sure to delete text file ?");
     if(isConfirmed){
     var ids=localStorage.getItem("selectedids");
     this.deletefilesid.filesid=ids;
     this.UserService.deleteMultipleTextfile(this.deletefilesid).subscribe(data => {
         
         window.location.reload();
        });
     console.log(localStorage.getItem("selectedids"));
    }
  }
  else
  {
     alert("Please select a text file to delete")
  }
}

 onChange($event:any)
 {
   console.log("fff",this.selectedCity);
   if(this.selectedCity=="Concordance")
   {
   console.log("in cordance")
   this.constatus=true;
   this.self=false;
   this.cluster=false;
   this.freq=false;
   this.frquecnycount=false;
   this.document_count=false;
   this.document_comparison = false;
   console.log(this.constatus)
   localStorage.setItem("type","concordance")
   }
   if(this.selectedCity=='self')
   {
        this.constatus=false;
        this.self=true;
        this.cluster=false;
        this.freq=false;
        this.frquecnycount=false;
        this.document_count=false;
        this.document_comparison = false;
        localStorage.setItem("type","self")
   }
   if(this.selectedCity=='cluster')
   {
      this.constatus=false;
      this.self=false;
      this.cluster=true;
       this.freq=false;
       this.showTable=true;
       this.document_comparison = false;
       this.document_count=false;
       localStorage.setItem("type","cluster")
   }
   if(this.selectedCity=='Frequency')
   {
     console.log("frquncy")
      this.constatus=false;
      this.self=false;
      this.cluster=false;
      this.freq=true;

      this.document_comparison = false;
      this.document_count=false;
       this.showTable=false;
       localStorage.setItem("type","Frequency")
   }
    if(this.selectedCity=='document_comparison'){
      this.getUrls();
      this.document_comparison = true;
      this.constatus=false;
      this.self=false;
      this.cluster=false;
      this.freq=false;
      this.frquecnycount=false;
     
      this.showTable=false;
      localStorage.setItem("type","document_comparison")
  }
 }
 concordanceapi()
 {
   

   console.log("concorncace api",  localStorage.getItem("type"));

   if(localStorage.getItem("type")=="cluster")
   {
         var pid=localStorage.getItem('projectId'); 
         var uid=localStorage.getItem('userId')
         var cluster = (<HTMLInputElement>document.getElementById("txtarea_cluster_pairs")).value;
         var ids=localStorage.getItem("selectedids");
         var selected_ids=ids + ",";
         this.clusterdata.txtarea_cluster_pairs=cluster;
         this.clusterdata.selected_ids=selected_ids;
         console.log(this.clusterdata)
          this.UserService.clusterSearch(this.clusterdata,pid,uid).subscribe(data => {
           this.concordanceObject=data.results;
            
            if(this.concordanceObject.length!=0)
           {
           this.showTable=true;
           }
           console.log("ng onit called");
          console.log( "data",data );
        });

   }
   else if(localStorage.getItem("type")=="self")
   {
         var pid=localStorage.getItem('projectId'); 
         var uid=localStorage.getItem('userId')
         var cid=localStorage.getItem("conceptlist");
         var ids=localStorage.getItem("selectedids");
         var selected_ids=ids + ",";
         this.loadingStatus=true;
         console.log(typeof(selected_ids))
          this.selfcon.selected_ids=selected_ids;
          this.selfcon.hf_cmb_concept_lists=cid;
          if(this.selfcon.selected_ids =="null," || this.selfcon.hf_cmb_concept_lists=="null")
          {
           this.loadingStatus=false; 
           alert("Concept List or Text List is missing. Please select appropriate input")   
          }
          console.log("api data",this.selfcon);

          var minLenght=(selected_ids.split(",").length-1)
          if(minLenght<=5){
          this.UserService.selfconcordancesearch(this.selfcon,pid,uid).subscribe(data => {
           this.concordanceObject=data.results;
          console.log( "self concordancedata",data );
            this.loadingStatus=false;
            if(this.concordanceObject.length!=0)
           {
           this.showTable=true;
           }
        });
       }
       else
        {
           alert("You may run this query on a maximum of 5 documents at a time")
        }
         
   }
   else if (localStorage.getItem("type")=="concordance")
   {
       console.log("write a[i for con")
     
      var lst_toi = (<HTMLInputElement>document.getElementById("lst_toi")).value;
      var ids=localStorage.getItem("selectedids");
      var selected_ids=ids + ",";
      var txt_toi=lst_toi;
      this.loadingStatus=true;
      var txt_cat="and"
      this.conscurdance.selected_ids=selected_ids;
      this.conscurdance.txt_toi=txt_toi;
      this.conscurdance.txt_cat=txt_cat;
      if(this.conscurdance.selected_ids =="null," || this.conscurdance.txt_toi==" ")
      {
           this.loadingStatus=false; 
           alert("Concept or Text List is missing. Please select appropriate input")   
      }

      console.log(this.conscurdance);
       var pid=localStorage.getItem('projectId'); 
         this.UserService.concurdanceSearch(this.conscurdance,pid).subscribe(data => {
           this.concordanceObject=data.results;
           this.loadingStatus=false;
           console.log("this.concordanceObject",this.concordanceObject)
           var jsondata=JSON.stringify(data.results)
           var jsonArray = JSON.parse(jsondata)
           /*
           var temp=[];
           for(var i=0;i<jsonArray.length;i++)
           {   
               temp.push(jsonArray[i].left)
               temp.push(jsonArray[i].toi)
               temp.push(jsonArray[i].right)
        
          }
           //var blob = new Blob([temp], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
           });
           //saveAs(blob, "Report.xls");
           //console.log(this.concordanceObject.length)
           */
           if(this.concordanceObject.length!=0)
           {
           this.showTable=true;
            this.frquecnycount=false;
           }
           console.log("ng onit called");
          console.log( "data",data.results );
        });

    }  
   else if(localStorage.getItem("type")=="Frequency")
   {
       console.log("write api for frequency")
       this.loadingStatus=true;
       var cid=localStorage.getItem("conceptlist");
         var ids=localStorage.getItem("selectedids");
         var selected_ids=ids + ",";
         var stoplist=localStorage.getItem("stoplistid");
         console.log(typeof(selected_ids))
          this.frequncy.selected_ids=selected_ids;
          this.frequncy.cmb_concept_lists=cid;
          this.frequncy.stoplist_id=stoplist;
          console.log("api data",this.frequncy);
          
          if(this.frequncy.selected_ids =="null," || this.frequncy.cmb_concept_lists=="null")
          {
           this.loadingStatus=false; 
           alert("Concept List or Text List is missing. Please select appropriate input")   
          }
          this.UserService.frequencycount(this.frequncy).subscribe(data => {
            this.originalData= Object.assign({}, data.results);
           this.concordanceObject=data.results;
          console.log( "frequncy count data",data );
           this.loadingStatus=false;
           var jsondata=JSON.stringify(data.results)
            localStorage.setItem("frequency_data",jsondata)
            if(this.concordanceObject.length!=0)
           {
           this.frquecnycount=true;
            this.showTable=false;
           }
        });
         

   }
   else if(localStorage.getItem("type")=="document_comparison"){
     this.document_count= false;
     var data = {};
     this.loadingStatus=true;
     data['ref_urls_id'] = this.selectedUrlIds
     data['ref_data_id'] = this.selectedIds
     data['cmp_urls_id'] = this.selectedUrlCmpIds
     data['cmp_data_id'] = this.selectedCmpIds
     data['concept_id']  = localStorage.getItem("conceptlist");
     var MinLength=this.selectedIds.length+this.selectedUrlIds.length+this.selectedUrlCmpIds.length+this.selectedCmpIds.length;
     if(data['ref_urls_id']=='' && data['ref_data_id']=='' && data['cmp_urls_id']=='' && data['cmp_data_id']=='')
     {
        alert("Please select suitable input !!");
     }
     else if(MinLength>20)
     {
          alert("You may run this query on a maximum of 20 documents at a time");
     }
     else
     {
     console.log("data requested",data);
     this.UserService.dataComparision(data).subscribe(data => {
      this.loadingStatus=false;
      this.document_count= true;
     this.frquecnycount = false;
     this.showTable=false;
            this.documentComparision= data;
            console.log("document coparsion===>",data)
            this.documentKeys={};
            if('RefereceUrls' in data){
                      this.documentKeys['RefereceUrls'] = Object.keys(data.RefereceUrls);
                      this.allDocumentCount['rurl_len'] = Object.keys(data.RefereceUrls).length;
            }
            if('RefereceData' in data){
                      this.documentKeys['RefereceData']  = Object.keys(data.RefereceData);
                      this.allDocumentCount['rdata_len'] = Object.keys(data.RefereceData).length;
            }
            if('ComparisionUrls' in data){
                      this.documentKeys['ComparisionUrls'] = Object.keys(data.ComparisionUrls);
                      this.allDocumentCount['curl_len']    = Object.keys(data.ComparisionUrls).length;
            } 
            if('ComparisionData' in data){
                      this.documentKeys['ComparisionData'] = Object.keys(data.ComparisionData);
                      this.allDocumentCount['cdata_len']   = Object.keys(data.ComparisionData).length;
            }
            console.log(this.documentKeys)
            console.log("in this key");
        });
       }
        


   }


 }
 public textList:any=[];
 selectedtextlist(ids,name)
 {
   if (this.docId.indexOf(ids) === -1) {
    this.docId.push(ids);
    this.textList.push(name);
  }
  else {
    var index = this.docId.indexOf(ids);
    this.docId.splice(index, 1);
    var nameIndex = this.textList.indexOf(name);
    this.textList.splice(nameIndex, 1);
  }
    localStorage.setItem("selectedids",this.docId);
    localStorage.setItem("text_list_name",this.textList);
     
   
  }

  test(valeu){

 
  var res = valeu.substring(0, 4);
   return res;

  }
  left(value)
  {
      var limit=localStorage.getItem("setlimit");
       var t = (value.split(" ")).reverse();
       if(limit) {
        var lastsevan=t.slice(0, limit);
        }
       else {
         var lastsevan=t.slice(0, 7);
        }

       

    return lastsevan.reverse().join(" ");
  }
  right(value)
  {
  var t = value.split(" ");
  var limit=localStorage.getItem("setlimit");
   if(limit) {
        var lastsevan=t.slice(0, limit);
        }
       else {
         var lastsevan=t.slice(0, 7);
        }
  console.log(decodeURIComponent((lastsevan.join(" "))));
   return lastsevan.join(" ");
  }
  conceptlist(event:any)
  { 
    console.log(event);
     localStorage.setItem("conceptlist",event);
    
  }
 
 navigateToEditor(dd,leftv,rightv,toi){
   console.log(dd)
   
       localStorage.setItem("fileid",dd);
        localStorage.setItem("fileid",dd);
       localStorage.setItem("left",rightv);
       localStorage.setItem("right",leftv);
       localStorage.setItem("toi",toi);
       var strWindowFeatures = "location=yes,height=500,width=800,scrollbars=yes,status=yes";
       window.open("http://repindex.com:4200/html/dist/#/editor?+fileid="+dd,"_blank",strWindowFeatures)
    // this.router.navigate(['/editor'],{ queryParams: { fileid: dd} });
     //setTimeout(function(){ window.location.reload() }, 300);
 }
 projectgo()
 {
    this.router.navigate(['/project']);
    //setTimeout(function(){ window.location.reload() }, 300);
 }
 newquery()
 {
   //this.router.navigate(['/user']);
    setTimeout(function(){ window.location.reload() }, 25);
 }
 stoplist(event:any)
 {
   console.log("===",event);
    localStorage.setItem("stoplistid",event);

 }
 gotoCharts()
 {
   var getfrequency=localStorage.getItem("frequency_data");
   console.log("=========getfrequency====",getfrequency)
   var strWindowFeatures = "location=yes,height=700,width=1000,scrollbars=yes,status=yes";
    window.open("http://repindex.com:4200/html/dist/#/charts","_blank",strWindowFeatures)

 }
 openlimit()
  {
    
    document.getElementById("limit").click();
  }
  setlimit(limit)
  {

     console.log(limit)
    if(limit<=50)
     {
    localStorage.removeItem("setlimit");
    localStorage.setItem("setlimit",limit);
    window.location.reload();
    }
    else
    {
      alert("The maximum context horizon is 50 words")
    }
  }
  setlang(lang)
  {

    console.log(lang);
    localStorage.removeItem("lang");
    localStorage.setItem("lang",lang);
    window.location.reload()
  }
  valueRage(textListname,file_id,LeftandRight)
 {
    
    $("#value").css("display","block");
    console.log('textListname',textListname);
    console.log('LeftandRight',LeftandRight);
    this.getRangeValue.value=localStorage.getItem("selectedids");

    this.getRangeValue.filename=textListname;
    this.getRangeValue.leftandright=LeftandRight;
    this.getRangeValue.file_id=file_id
    this.UserService.getRange(this.getRangeValue).subscribe(data => {
     this.NotFound=false;
     var array1=[];
     this.rangeStatus=true;
     this.fileNme=data.file;
     if(data.diff[0] == 0)
     {
        this.NotFound=true;
     }
     this.valueList=data.diff;
     
     

    });
    


    return false;
 }
 closeAll()
 {
  $("#value").css("display","none");
 }
  selectFolder(id:any){

     this.docId=[];
      for(var i in this.textdata){
        if(id === this.textdata[i].fields.folder_id){
          this.textdata[i]['selected'] =true;
          this.docId.push(this.textdata[i].pk)
          console.log("this.docId",this.textdata[i].pk);
        }else{
          this.textdata[i]['selected'] =false;
        }
      }
      localStorage.setItem("selectedids",this.docId);
  }

navigateData(id){
      
      var data = [];
      var urls = [];
      //urls
      for(var i in this.url_info){
        if(this.url_info[i].fields.folder_id == id){
          this.url_info[i].parent_id = id;
          urls.push(this.url_info[i])
        }
      }
      this.urlsData = urls;
      
    //document
      for(var i in this.text_list_ref_data){
        if(this.text_list_ref_data[i].fields.folder_id == id){
          this.text_list_ref_data[i].parent_id = id;      
        data.push(this.text_list_ref_data[i])
        }
      }
      
    //subfolder document
    for(var i in this.text_folders){
      if(this.text_folders[i].fields.parent_folder_id == id){
        var sub_id = this.text_folders[i].pk
          for(var i in this.text_list_ref_data){
            if(this.text_list_ref_data[i].fields.folder_id == sub_id){
              this.text_list_ref_data[i].parent_id = id;      
              data.push(this.text_list_ref_data[i])
            }
          }
      }
    }
  this.folderRefRecords = data;
  this.currentState = !this.currentState;
}


navigateCmpData(id){

      
      var data = [];
      var urls = [];
      //urls
      console.log("urls===>",this.url_cmp_info)
      for(var i in this.url_cmp_info){
        if(this.url_cmp_info[i].fields.folder_id == id){
          this.url_cmp_info[i].parent_id = id;
          urls.push(this.url_cmp_info[i])
        }
      }
      this.urlsCmpData = urls;
      
    //document
      for(var i in this.text_list_cmp_data){
        if(this.text_list_cmp_data[i].fields.folder_id == id){
          this.text_list_cmp_data[i].parent_id = id;      
        data.push(this.text_list_cmp_data[i])
        }
      }
      
    //subfolder document
    for(var i in this.text_folders){
      if(this.text_folders[i].fields.parent_folder_id == id){
        var sub_id = this.text_folders[i].pk
          for(var i in this.text_list_cmp_data){
            if(this.text_list_cmp_data[i].fields.folder_id == sub_id){
              this.text_list_cmp_data[i].parent_id = id;      
              data.push(this.text_list_cmp_data[i])
            }
          }
      }
    }
  this.folderCmpRecords = data;
  this.currentCmpState = !this.currentCmpState;
}


selctedUrlsId(urlId){
  if( this.selectedUrlIds.includes(urlId)){
    this.selectedUrlIds = this.selectedUrlIds.filter(item => item !== urlId)
    for(var i in this.url_info){
        if(this.url_info[i].pk == urlId){
          this.url_info[i].checked = false;
        }
    }
  }else{
    this.selectedUrlIds.push(urlId);
    for(var i in this.url_info){
        if(this.url_info[i].pk == urlId){
          this.url_info[i].checked = true;
        }
    }
  }
  console.log(this.selectedUrlIds)
}

selctedDocumentId(id){
        console.log(this.folderRefRecords)
        if( this.selectedIds.includes(id)){
          this.selectedIds = this.selectedIds.filter(item => item !== id)
          for(var i in this.folderRefRecords){
              if(this.folderRefRecords[i].pk == id){
                this.folderRefRecords[i].checked = false;
              }
          }
        }else{
          this.selectedIds.push(id);
          for(var i in this.folderRefRecords){
              if(this.folderRefRecords[i].pk == id){
                this.folderRefRecords[i].checked = true;
          }   
        }
      }
}


selctedUrlsCmpId(urlId){
  if( this.selectedUrlCmpIds.includes(urlId)){
    this.selectedUrlCmpIds = this.selectedUrlCmpIds.filter(item => item !== urlId)
    for(var i in this.url_cmp_info){
        if(this.url_cmp_info[i].pk == urlId){
          this.url_cmp_info[i].checked = false;
        }
    }
  }else{
    this.selectedUrlCmpIds.push(urlId);
    for(var i in this.url_cmp_info){
        if(this.url_cmp_info[i].pk == urlId){
          this.url_cmp_info[i].checked = true;
        }
    }
  }
}
selctedDocumentCmpId(id){
    if( this.selectedCmpIds.includes(id)){
      this.selectedCmpIds = this.selectedCmpIds.filter(item => item !== id)
      for(var i in this.folderCmpRecords){
          if(this.folderCmpRecords[i].pk == id){
            this.folderCmpRecords[i].checked = false;
          }
      }
    }else{
      this.selectedCmpIds.push(id);
      for(var i in this.folderCmpRecords){
          if(this.folderCmpRecords[i].pk == id){
            this.folderCmpRecords[i].checked = true;
      }   
    }
  }
}

 getUrls(){
      var pid=localStorage.getItem('projectId'); 
      this.UserService.getDocumentUrl(pid).subscribe(data => {
        for(var i in data){
          data[i].checked = false;
        }
        this.urls_data = data;
        this.url_info = JSON.parse(JSON.stringify( data ));
        this.url_cmp_info = JSON.parse(JSON.stringify( data ));

      });
 }
 public documentId:any;
 public selectedTermsData:any ;
 public checkDataAvailable:boolean = false;
 public viewResultStatus:boolean = false;
  selectedConcept(docId, conceptId){
  this.documentId=docId;
  this.viewResultStatus=true;
    $("#selectedUrlData").css("display","block");
    var umbrellaId = this.documentComparision['UmbrellaIds'][conceptId]
    var data = {'doc_id':docId,'umbrella_id':umbrellaId};  
    this.textId=docId;
    this.UserService.getAvailableData(data).subscribe(newData => {
      this.selectedTermsData = newData.data;
     
      if(newData.data.length){
        this.selectedTermsData  = newData.data;
        this.checkDataAvailable=true;
      }else{
         this.checkDataAvailable= false;
      }      
    });
  }
  selectedUrls(urlId, conceptId){
  this.viewResultStatus=false;
     $("#selectedUrlData").css("display","block");
    var umbrellaId = this.documentComparision['UmbrellaIds'][conceptId]
    var data = {'url_id': urlId,'umbrella_id':umbrellaId};  
    
    this.UserService.getAvailableUrlsData(data).subscribe(newData => {
      this.selectedTermsData = newData.data;
      if(newData.data.length){
        this.selectedTermsData  = newData.data;
        this.checkDataAvailable=true;
      }else{
         this.checkDataAvailable= false;
      }
    });
    

  }
  closeDocumentData()
  {
     $("#selectedUrlData").css("display","none");
  }
  ViewResultComparison(id)
  {
   
    var strWindowFeatures = "location=yes,height=500,width=800,scrollbars=yes,status=yes";
     window.open("http://repindex.com:4200/html/dist/#/editor?+fileid="+id,"_blank",strWindowFeatures)
  }
  uncheckFolder()
  {
    
    for(var i in this.textdata){
     
          this.textdata[i]['selected'] =false;
        
      }
     localStorage.setItem("selectedids","0");
     this.docId=[];
  }
 umbrellaRange(valeu){

 
  var res = valeu.substring(0, 10);
   return res;

  }
  
 

}
