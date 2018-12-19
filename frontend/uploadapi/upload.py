import os
from flask import Flask, request, redirect, url_for
from werkzeug.utils import secure_filename
import json
from flask import send_from_directory
from flask_restful import reqparse, abort, Api, Resource, fields
from flask_cors import CORS
from werkzeug.exceptions import HTTPException, BadRequest
from hashids import Hashids
from flask import request,jsonify
from flask import Response
import os
import errno
import logging
import logging_tree
import magic

from flask_marshmallow import Marshmallow

#from models import db
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import json


app = Flask(__name__)
db = SQLAlchemy(app)
ma = Marshmallow(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://DB_USER:PASSWORD@HOST/DATABASE'

POSTGRES = {
    'user': 'knowledge',
    'pw': 'knowledge',
    'db': 'knowledge',
    'host': 'localhost',
    'port': '5432',
}
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES

migrate = Migrate(app, db)
ma=Marshmallow(app)

db.init_app(app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
class documents(db.Model):
    """Model for the stations table"""
    __tablename__ = 'documents'

    id = db.Column(db.Integer, primary_key = True)
    path = db.Column(db.Text)
    content = db.Column(db.Text)
class Searchdb(db.Model):
    """Model for the stations table"""
    __tablename__ = 'Searchdb'

    id = db.Column(db.Integer, primary_key = True)
    Name = db.Column(db.Text)
    Keywords = db.Column(db.Text)
class SearchSchema(ma.ModelSchema):
      class meta:
            model=Searchdb
            fields = ('Name', 'Keywords')
db.create_all()


#app = Flask(__name__)
LOG = logging.getLogger(__name__)
#logging.basicConfig()
UploadUrl="/var/www/release-v2.0.0/uploadapi/_uploads/"
class RequestFormatter(logging.Formatter):
    def format(self, record):
        record.url = request.url
        record.remote_addr = request.remote_addr
        return super(RequestFormatter, self).format(record)

formatter = RequestFormatter(
    '[%(asctime)s] %(levelname)s %(module)s <%(remote_addr)s @ %(url)s> %(message)s'
)

# from https://gist.github.com/eas604/b7e525fc135723028aed
def sha256_file(file_path, chunk_size=65336):
    """
    Get the sha 256 checksum of a file.
    :param file_path: path to file
    :type file_path: unicode or str
    :param chunk_size: number of bytes to read in each iteration. Must be > 0.
    :type chunk_size: int
    :return: sha 256 checksum of file
    :rtype : str
    """
    assert isinstance(chunk_size, int) and chunk_size > 0
    import hashlib
    import functools
    digest = hashlib.sha256()
    with open(file_path, 'rb') as fh:
        for chunk in iter(functools.partial(fh.read, chunk_size), ''):
            digest.update(chunk) 
    return digest.hexdigest()

# not really a hash since it's invertible. Easier than messing with
# b64 or other encodings though.
def filename_hashify(filename, salt=''):
    h = Hashids(salt=salt)
    return h.encode(*list(ord(x) for x in unicode(filename)))

def filename_dehashify(filehash, salt=''):
    h = Hashids(salt=salt)
    ret = ''.join(unichr(x) for x in h.decode(filehash))
    if ret == '':
        raise ValueError('invalid fileref supplied')
    return ret

def resolve_conflict(dest_path):
    """
    taken from https://github.com/jeffwidman/flask-uploads/blob/master/flask_uploads.py
    """
    dest_dir, dest_basename = os.path.split(dest_path)
    name, ext = os.path.splitext(dest_basename)
    count = 0
    # TODO: this is possibly a DOS if someone wants it to be.
    while True:
        count = count + 1
        newname = '%s_%d%s' % (name, count, ext)
        newpath = os.path.join(dest_dir, newname)
        if not os.path.exists(newpath):
            return newpath

def excl_save_uploadfile(src_obj, dst_path, **kwargs):
    flags = os.O_CREAT | os.O_EXCL | os.O_WRONLY

    try:
        file_handle = os.open(dst_path, flags)
    except OSError as e:
        if e.errno == errno.EEXIST:  # Failed as the file already exists.
            raise ValueError('file %s exists' % dst_path)
        else:  # Something unexpected went wrong so reraise the exception.
            raise
    else:  # No exception, so the file must have been created successfully.
        with os.fdopen(file_handle, 'w') as file_obj:
            src_obj.save(file_obj, **kwargs)

RESTRICT_FILETYPES = False
UPLOAD_FOLDER = os.environ.get('OPENSECRET_UPLOAD_FOLDER', '/var/www/release-v2.0.0/uploadapi/_uploads')
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'tif', 'tiff'])


CORS(app, origins=[r'.*\.mhnlabs\.co\.uk$','*'], supports_credentials=True)
api = Api(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
#app.config['SERVER_NAME'] = 'opensecret.mhnlabs.co.uk:5050'
if 'VIRTUAL_HOST' in os.environ:
    app.config['SERVER_NAME'] = os.environ['VIRTUAL_HOST']
# if 'OPENSECRET_UPLOAD_URL' in os.environ:
#     app.config['SERVER_NAME'] = 

app.config['PREFERRED_URL_SCHEME'] = 'http'

app.logger.handlers[0].setFormatter(formatter)

def allowed_file(filename):
    if not RESTRICT_FILETYPES:
        return True
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

def fq_url_for(*args, **kwargs):
    rel_url = url_for(*args, **kwargs)
    if rel_url[0] == '/':
        rel_url = rel_url[1:]
        
    url_base = os.environ.get('OPENSECRET_UPLOAD_URL', '')
    return url_base + rel_url

class FileCollection(Resource):
    def get(self):
        filelist = os.listdir(app.config['UPLOAD_FOLDER'])
        ret = {}
        for f in filelist:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], f)
            file_mime = magic.from_file(file_path, mime=True)
            fileref = filename_hashify(f)
            content_url = fq_url_for('uploaded_file', filename=f, _external=False)
            resource_url = fq_url_for('filedetail', fileref=fileref, _external=False)

            ret[fileref] = {
                'name': f,
                'url': content_url,
                'res_url': resource_url,
                'mimetype': file_mime,
            }
            
        return {'files': ret}, 200
    
    def post(self):
        if 'file' not in request.files:
            return {'error': 'no file specified'}, 400
        
        file = request.files['file']
        LOG.info('file=%r' % file)
        #import ipdb; ipdb.set_trace();
        # if user does not select file, browser also
        # submit a empty part without filename
        if file.filename == '':
            return {'error': 'no filename provided'}, 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            dst_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            # retry this some number of times, because resolve_conflict could still
            # (very unlikelyily) get clobbered between checking and the save below.
            save_attempts = 3
            while save_attempts > 0:
                save_attempts -= 1
                try:
                    excl_save_uploadfile(file, dst_path)
                    break
                except ValueError as e:
                    dst_path = resolve_conflict(dst_path)
            else:
                return {'error': 'unable to uniqify, file exists'}, 400

            actual_filename = os.path.relpath(dst_path, app.config['UPLOAD_FOLDER'])
            file_url = fq_url_for('uploaded_file', filename=actual_filename, _external=False)
            import mammoth
            with open(UploadUrl+actual_filename, "rb") as docx_file:
                 result = mammoth.convert_to_html(docx_file)
                 html = result.value # The generated HTML
            print "=============>",html
            data = documents(path=actual_filename, content=html)
            db.session.add(data)
            db.session.commit()
            return {'filepath': file_url}, 201
        else:
            return {'error': 'filetype not allowed'}, 400
class FileContent(Resource):
      def post(self):
          ActulPath=request.get_json().get('path')
          print "=====ActulPath=====",ActulPath
          query = documents.query.filter_by(path=ActulPath).scalar()
          return {'FileContent':query.content},200
          
class SaveSearch(Resource):
      def post(self):
          searchInput=request.get_json().get('name')
          keywordsInput=request.get_json().get('keywords')
          print "==========searchInput",searchInput
          print "==========keywordsInput",keywordsInput
          data = Searchdb(Name=searchInput,Keywords=keywordsInput)
          db.session.add(data)
          db.session.commit()
          return {'msg':'successfully save search'},200
      def get(self):
          searchResult=Searchdb.query.all()
          print searchResult
          listObject=[i.__dict__ for i in searchResult]
          print "==============>",listObject
          #return Response({'search':jsonify(listObject)})
          #dictionaries = [ obj for obj in searchResult ]
          return Response(json.dumps({"data": listObject}, sort_keys=True, default=str),content_type='application/json')
          

class FileDetail(Resource):
    def get(self, fileref):
        try:
            filename = secure_filename(filename_dehashify(fileref))
        except ValueError as e:
            return {'ref': fileref, 'errors': ['not found']}, 404
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        LOG.debug('name=%s, path=%s', filename, filepath)
        if os.path.exists(filepath):
            return {
                'ref': fileref,
                'name': filename,
                'size': os.stat(filepath).st_size,
                'sha256': sha256_file(filepath),
                'mimetype': magic.from_file(filepath, mime=True)
            }, 200
        else:
            return {'ref': fileref, 'errors': ['not found']}, 404
        
    def delete(self, fileref):
        try:
            filename = secure_filename(filename_dehashify(fileref))
        except ValueError as e:
            return {'ref': fileref, 'errors': ['not found']}, 404
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        LOG.debug('name=%s, path=%s', filename, filepath)
        if os.path.exists(filepath):
            assert '_uploads' in filepath # for reassurance
            os.remove(filepath)
            return {'errors': []}, 200
        else:
            return {'errors': 'not found: %s' % filepath}, 404
        
api.add_resource(FileCollection, '/files')
api.add_resource(FileContent, '/FileContent')
api.add_resource(FileDetail, '/files/<string:fileref>/')
api.add_resource(SaveSearch, '/SaveSearch')

def main(reloadp=False, debug=False, showlogconf=False):
    if showlogconf:
        logging_tree.printout()
    LOG.warn('upload.main() running')
    app.run(debug=debug, use_reloader=reloadp, host='0.0.0.0', port=5050)

if __name__ == '__main__':
    import sys
    args = sys.argv[:]
    #LOG.warn("Args: %r" % args)
    debug = '-debug' in args
    reloadp = '-noreload' not in args
    if '-api' in args:
        main(reloadp=reloadp, debug=debug)
