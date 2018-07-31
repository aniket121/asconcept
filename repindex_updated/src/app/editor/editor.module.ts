import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DropdownModule } from 'ng2-bootstrap/dropdown';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { editorComponent } from './editor.component';
import { editorRoutingModule } from './editor-routing.module';
import { CKEditorModule } from 'ng2-ckeditor';
import { HttpModule } from '@angular/http';
import { editorService } from './editor.service';
import { CommonModule } from '@angular/common';  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
 


@NgModule({
  imports: [
    CKEditorModule,
    editorRoutingModule,
    ChartsModule,
    DropdownModule, BootstrapModalModule,HttpModule,CommonModule,FormsModule
  
  ],
  declarations: [editorComponent ],
   providers: [editorService
       
  ],
})
export class editorModule { }
