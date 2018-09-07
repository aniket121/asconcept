import { UPLOAD_URL_BASE } from './config';

export class UploadService {
    constructor(urlbase) {
        this.urlbase = urlbase;
    }

    upload(file, progressCallback) {
        let fd = new FormData();
        fd.append('name', file.name);
        fd.append('size', file.size);
        fd.append('type', file.type);
        fd.append('file', file);
        return $.ajax({
            type: 'POST',
            url: "http://127.0.0.1:8002" + '/files',
            data: fd,
            processData: false,
            contentType: false,
            xhr: () => {
                let xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", (e) => {
                    progressCallback(e.lengthComputable, e.loaded, e.total);
                }, false);
                return xhr;
            },
        });
    }
}

export class MockUploadService extends UploadService {
    upload(file, progressCallback) {
        let fname = file.name;
        let fsize = file.size;
        var uploadedPercent = 0;
        var doneCb = null;
        var alwaysCb = null;

        let mockprogress = () => {
            uploadedPercent = uploadedPercent + (Math.random() * 5);

            if(progressCallback) {
                progressCallback(true, Math.floor((fsize * uploadedPercent)/100.0), fsize);
            }

            if(uploadedPercent >= 100) {
                if(doneCb !== null) {
                    setTimeout(() => {
                        doneCb({"filepath": "https://mock.invalid/upload/" + fname});
                        if(alwaysCb !== null) { alwaysCb(); }
                    }, 350);
                }
            } else {
                setTimeout(mockprogress, (Math.random() * 100) + 20);
            }
        };

        setTimeout(mockprogress, 50);

        return {
            "done": function(cb) { doneCb = cb; return this; },
            "fail": function(cb) { return this; },
            "always": function(cb) { alwaysCb = cb; return this; },
        };
    }
}

