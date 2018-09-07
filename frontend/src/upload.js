global.$ = $;
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';

import {FileUpload} from './FileUpload';
import Handlebars from 'handlebars';
import download from 'downloadjs';

$(function () {
    console.log('moo');
    let $ctr = $('#sidebar-form');
    let $ff = $('#filefield');
    let $fb = $('#filebtn');
    let $fl = $('#filelist');

    let $fetchbtn = $('#fetchfilelist-btn');
    let $filedirlist = $('#filedirlist');
    
    let progtemplate = Handlebars.compile($("#progress-template").html());
    let html = progtemplate({progpct: "86"});
    $('#sidebar-form').append(html);

    let fileitemtmpl = Handlebars.compile($("#fileitem-template").html());
    window.t = {}
    window.t.prog = progtemplate;
    window.t.fitem = fileitemtmpl;
    
    window.app = {uploads: []};

    $(document).on('click', 'a.fileitem-link', (e) => {
        e.preventDefault();
        e.stopPropagation();
        let $target = $(e.currentTarget);
        let url = $target.prop('href');
        if ($target.hasClass('item-download')) {

            // let xdl = new XMLHttpRequest();
            // xdl.open("GET", url , true);
            // xdl.responseType="blob";
            // xdl.onload=function(ole){download(ole.target.response, "cats.txt", "text/plain");};
            // xdl.send();
            download(url);
        } else if ($target.hasClass('item-delete')) {
            console.log('delete item url=', url);
            $.ajax({url: url, method: 'DELETE'})
                .done((dele) => {
                    console.log('deleted file at ', url);
                    $target.parent().remove()
                })
                .fail((dele) => {
                    console.error('delete failed for ', url, dele);
                    $target.parent().style('color', 'red');
                });
        } else {
            console.error('unknown action for fileitem link:', $target, e);
        }
    });
    $fetchbtn.on('click', (e) => {
        e.preventDefault();
        $.ajax('http://opensecret.mhnlabs.co.uk:5050/files')
            .done(resp => {
                console.log('resp=', resp);
                $filedirlist.empty();
                for (let fref of Object.keys(resp.files)) {
                    let fprops = resp.files[fref];
                    let item = fileitemtmpl({name: fprops.name, url: fprops.url, del_url: fprops.res_url})
                    $filedirlist.append($(item));
                }
            });
    });
    $('#testform').on('submit', (e) => {
        alert('in upload.js')
        e.preventDefault();
        console.log('form submitted?', e);
        let files = Array.from($ff.get(0).files);
        let fu = new FileUpload('http://opensecret.mhnlabs.co.uk:5050/files');
        fu.upload(files[0]);
    });
    
    
    $ff.on('change', (e) => {
        console.log('filechange event', e);
        let files = Array.from(e.currentTarget.files);
        //debugger;
        if (files.length > 0) {
            $fl.empty();
        }
        for (let f of files) {
            console.log('file=', f);
            $fl.append($('<li>').text(`${f.name} (${f.size} bytes): ${f.type}`));
        }
        //files.forEach(x => { console.log('file: ', x) });
        
        //$fl.append($('<li>').text(e));
    });
    
    $fb.on('click', (e) => {
        if ($ff) {
            $ff.click();
        }
        e.preventDefault();
        e.stopPropagation();
    });
});
