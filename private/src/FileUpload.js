export class FileUpload {
    constructor(upload_uri) {
        //let reader = new FileReader();

        //this.ctrl = document.getElementById('up-progress'); //createThrobber(img);
        this.ctrl = $('#prog');
        this.xhr = new XMLHttpRequest();
        this.xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
                let percentage = Math.round((e.loaded * 100) / e.total);
                this.ctrl.text(`${percentage}% (${e.loaded} / ${e.total}`);
            }
        }, false);
        this.xhr.upload.addEventListener("load", (e) => {
            this.ctrl.text('100%');
        }, false);
        this.xhr.upload.addEventListener("abort", (e) => {
            this.ctrl.text('aborted');
        }, false);

        this.xhr.upload.addEventListener('loadstart', (e) => {
            let $cancel = $('<a>').prop('href', '#').text('cancel').on('click', (ce) => {
                console.log('cancel clicked');
                if (this.xhr && this.xhr.status === 0) {
                    this.xhr.abort();
                } else {
                    console.log('cannot cancel');
                }
            });
            $('#upcancel').append($cancel);
            this.ctrl.text('...');
        }, false);

        this.xhr.open("POST", upload_uri, true);
    }
    upload(file_obj) {
        let fd = new FormData();
        fd.append('file', file_obj);
        console.log('uploading file=', file_obj, 'fd=', fd);
        this.xhr.send(fd); // file_obj.slice());
        //this.xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
        // reader.onload = (evt) => {
        //     xhr.send(evt.target.result);
        // };
        // reader.readAsBinaryString(file);

    }



}
