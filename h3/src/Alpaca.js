//import tokenfield from 'bootstrap-tokenfield';
//import 'imports-loader?define=>false,this=>window!alpaca/dist/alpaca/bootstrap/alpaca.js'

import { UploadService } from './UploadService';

const fieldType2Alpaca = {
    "str-long": {
        "schema": "string",
        "field": "textarea",
    },
    "str": {
        "schema": "string",
        "field": "text",
    },
    "email": {
        "schema": "string",
        "field": "email",
    },
    "file": {
        "schema": "string",
        "field": "osfile", // FIXME do actual file uploading
    },
    "token": {
        "schema": "string",
        "field": "simplekeyword",
        //"field": "text",
        //        "field": "token", // FIXME
    },
};

 function getFileContent(fileName){
   
   var path={path: fileName.split("/")[1]};
   $.ajax({
        url: "https://mattersmith3.embeddedexperience.com/upload/FileContent",
        type: "POST",
        data: JSON.stringify(path),
        dataType: 'json',
        contentType: 'application/json',
        async: true,
        success: function(data) {
            
            //$("#editor1").css("display":"block");
            //CKEDITOR.replace('editor1')

            if (CKEDITOR.instances.editor1)
               {
                 CKEDITOR.instances.editor1.destroy();
                 CKEDITOR.replace("editor1");
                }
            else{
                CKEDITOR.replace("editor1");
            }
            CKEDITOR.instances['editor1'].setData(data.FileContent);
        
        },
        error: function(msg) {
            
           console.log("error occured");
           CKEDITOR.instances.editor1.destroy();
            
        }
       });
    }


// probably not very efficient, but this is the only way it seems to work...?!
function getPatchedAlpaca(uploadService) {
    if(window._Alpaca) { return window._Alpaca; }

    let $ = require('jquery');
    let tokenfield = require('imports-loader?define=>false!bootstrap-tokenfield')($);
    let alpaca = require('inject-loader!imports-loader?define=>false!alpaca')({ 'jquery': $ });

    // Patch in our custom field
    alpaca.Fields.OSFileField = alpaca.Fields.TextField.extend({
        os_getUploadDone: function() {
            return this._os_uploadDone ? true : false;
        },
        afterRenderControl: function(model, callback) {
            let self = this;
            this.base(model, function() { // everything has to be wrapped in this for some reason
                if(self.isDisplayOnly()) {
                    if(self.control && self.data && self.data !== '') {
                        //debugger;
                        $(self.control).after( $('<a>').attr('onclick', getFileContent(self.data)).attr('target', '_blank').text('') );
                        if(self.data.split("/")[1]==""){
                          
                            $(self.control).after( $('<a>').attr('href',self.data).attr('target', '_blank').text('Download File') );
                        }
                        else{
                              $(self.control).after( $('<a>').attr('href', "https://mattersmith3.embeddedexperience.com/upload/"+self.data).attr('target', '_blank').addClass('download').text('Download File') );
                        }
                        
                        window.fileName=self.data;
                        $(self.control).hide();
                    }

                } else {
                    if(self.control) {
                        $(self.control).attr('type', 'file').removeClass('form-control');
                        self.uploadElement = $('<button type="button">').text('Upload').addClass('btn btn-primary btn-block btn-sm');

                        // alpaca dom hax? just attach our upload button after the file input, idk how it's actually supposed to work...
                        $(self.control).after(self.uploadElement);

                    self.uploadElement.click((e) => {
                        // when the upload button is pressed
                        // 1 make sure we have a file
                        // 2 replace the upload button with a progress bar
                        // 3 fire off the upload
                        let hasFile = $(self.control).get(0).files.length > 0;
                        let file = $(self.control).get(0).files[0];
                        console.log('Upload button pressed! hasFile', hasFile, 'file',  file); 

                        if(hasFile) {
                            // show a progress bar
                            $(self.control).attr('type', 'hidden');
                            $(self.control).hide();
                            let progressBar = $('<div class="progress-bar progress-bar-striped active" role="progressbar">').width('100%'); //FIXME default width
                            progressBar.text("Please wait...");
                            let progressBarCtr = $('<div class="progress">').append(progressBar);
                            $(self.uploadElement).replaceWith(progressBarCtr);

                            // upload the file
                            uploadService.upload(file,
                                (hasTotal, loaded, total) => {
                                    if(hasTotal) {
                                        let pc = Math.floor((loaded / total) * 100.0).toString() + '%';
                                        console.log('upload update', hasTotal, loaded, total, pc);

                                        if(pc === '100%') {
                                            progressBar.addClass('progress-bar-striped active');
                                            progressBar.text('Storing file...');
                                            progressBar.width('100%');
                                        } else {
                                            progressBar.text('Uploading ('+pc+')...');
                                            //progressBar.width(pc);
                                        }
                                    }
                                }
                            ).done((data) => {
                                progressBar.text('Upload Complete');
                                progressBar.removeClass('progress-bar-striped active');
                                progressBar.addClass('progress-bar-success');
                                console.log('file upload result', data);
                                $(self.control).val(data.filepath);
                                self.data = data.filepath;
                                progressBarCtr.css('margin-bottom', '4px');
                                progressBarCtr.after( $('<a>').attr('href', "https://mattersmith3.embeddedexperience.com/upload/"+data.filepath).attr('target', '_blank').text('Download File') );
                                self._os_uploadDone = true;
                            }).fail(() => {
                                progressBar.text('Something went wrong');
                                progressBar.addClass('progress-bar-danger');
                            });
                        }
                    });

                }
                }
                callback(); // this has to be here for some reason
            });
        },
    });


    alpaca.Fields.SimpleKeywordField = alpaca.Fields.TextField.extend({
        getFieldType: function() { return "simplekeyword"; },
        setValue: function(val) {
            let strval = val
            this.base(strval);
        },
        getValue: function() {
            let strval_ = this.base();

            // FIXME: this line is just a hack to make pre-migration broken keywords prop work, remove it later
            let strval = Array.isArray(strval_) ? strval_[0] : strval_;

            console.log('strval', strval);
            let val = strval.split(/\s*,\s*/);
            return val;
        }
    });

    alpaca.registerFieldClass("osfile", alpaca.Fields.OSFileField);
    alpaca.registerFieldClass("simplekeyword", alpaca.Fields.SimpleKeywordField);

    window._Alpaca = alpaca;
    return window._Alpaca;

}

export class Alpaca {
    constructor(uploadService) {
        this.uploadService = uploadService;
        this.patchedAlpaca = getPatchedAlpaca(uploadService);
    }

    getControl(ele) {
        return this.patchedAlpaca(ele, "get");
    }

    renderForm(formData) {
        let alpaca = this.patchedAlpaca;
        var ele = $('<div>');
        alpaca(ele, formData);
        return ele;
    }

    generateAndRenderForm(fields, props, readOnly, buttons, view_type='bootstrap-edit-horizontal', isUpdate=false) {
        return this.renderForm( this.generateForm(fields, props, readOnly, buttons, view_type, isUpdate) ); 
    }

    generateForm(fields, props, readOnly, buttons, view_type='bootstrap-edit-horizontal', isUpdate=false) {
        var schemaProperties = {};
        var optionsFields = {};

        Object.keys(fields).forEach((k) => {
            const fieldTypes = fieldType2Alpaca[ fields[k].type ];

            if(isUpdate && fields[k].type === 'file') { } // don't show files when editing

            schemaProperties[k] = {
                "type": fieldTypes.schema,
                "readonly": readOnly,
            };

            optionsFields[k] = {
                "type": fieldTypes.field,
                "label": fields[k].label,
            };
        });

        var options = {
            "fields": optionsFields,
            "focus": "",
            "form": {
                "buttons": buttons
            },
        };

        var alpacaData = {
            "data": props,
            "schema": {
                "type": "object",
                "properties": schemaProperties,
            },
            "options": options,
            "postRender": function(control) {
                if (control.form) {
                    control.form.registerSubmitHandler(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        control.form.getButtonEl('submit').click();
                    });
                }
            },
            "view": view_type,
        };

        return alpacaData;
    }
}
