#!/usr/bin/env python

import logging
import logging_tree
from datetime import datetime

LOG = logging.getLogger(__name__)

import json
import itertools

from flask import Flask, request
from flask_restful import reqparse, abort, Api, Resource, fields
from flask_cors import CORS
from werkzeug.exceptions import HTTPException, BadRequest
from copy import copy

from knowledge import graph, schema, fixture

app = Flask(__name__)
api = Api(app)
CORS(app, origins=[r'.*\.mhnlabs\.co\.uk$',"*"], supports_credentials=True)


class InstanceDetail(Resource):
    class_parser = reqparse.RequestParser()
    class_parser.add_argument('class_name', type=str, required=True)

    def _get_class_fieldparser(self, clsobj):
        parser = reqparse.RequestParser()
        type_map = {'str-long': unicode, 'token': str, 'str': unicode, 'int': int, 'file': unicode, 'email': unicode,'list':unicode }
        for fname, fspec in clsobj.fields.iteritems():
            ftype = type_map[fspec['type']]

            LOG.info('ID: adding field %s, type=%s, req=%s' % (
                fname, fspec['type'], fspec['required']))
            parser.add_argument(fname, location=['json'],
                                type=ftype, required=False)
        return parser

    def get(self, instance_id):
        instobj = schema.Instance.fetch_by_id(int(instance_id))
        if instobj is None:
            return {'error': 'Instance with instance_id: {} cannot be found'.format(int(instance_id))}, 404
        return instobj.__dict__, 200

    def post(self, instance_id):
        """Creates a new Instance node"""

        instobj = schema.Instance.fetch_by_id(int(instance_id))
        print "=========created new instance=====>",instobj
        if instobj is None:
            return {'error': 'Instance with instance_id: {} cannot be found'.format(int(instance_id))}, 404
        inst_class = instobj.instance_of
        clsobj = schema.Class.fetch_by_name(inst_class)
        try:
            field_spec = clsobj.fields
            field_parser = self._get_class_fieldparser(clsobj)
            LOG.info('ID post parser=%r' % field_parser)
            LOG.info('ID post req=%r, %r' % (request.form, request.json))
            new_props = field_parser.parse_args()
        except BadRequest as br:
            LOG.error(type(br))
            br.data['schema'] = field_spec
            raise br
        LOG.info('new props: %r' % new_props)
        nonempty_props = {k: v for k, v in new_props.iteritems() if v is not None}
        orig_props = copy(dict(instobj.__dict__))

        # get field(s)
        # do some changes.
        schema.Instance.update_properties(instobj._id, nonempty_props)
        newinst = schema.Instance.fetch_by_id(int(instance_id))
        print  "new props===========",new_props
        #new_props.append({'custom_id':'5'})
        return {'status': 'success', 'req_props': new_props, 'old_props': orig_props, 'new_props': dict(newinst.__dict__) }, 200

    def put(self, instance_id):
        return 'todo!', 405

    def delete(self, instance_id):
        schema.Instance.delete_by_id(int(instance_id))
        return None, 204


class InstanceCollection(Resource):
    
    class_parser = reqparse.RequestParser(bundle_errors=True)
    class_parser.add_argument('class_name', type=str,
                              location=['form', 'json'], required=True)

    def _get_class_fieldparser(self, clsobj):
        parser = reqparse.RequestParser()
        type_map = {'str-long': unicode, 'token': str, 'str': unicode, 'int': int, 'file': str, 'email': unicode,'list':unicode  }
        for fname, fspec in clsobj.fields.iteritems():
            ftype = type_map[fspec['type']]

            LOG.info('adding field %s, type=%s, req=%s' % (
                fname, fspec['type'], fspec['required']))
            parser.add_argument(fname, location=['json'],
                                type=ftype, required=fspec['required'])
        return parser

    def get(self, inst_class=None):
        if inst_class:
            return 'class=%s' % inst_class
        return graph.query('match (x:Instance)-[:instance_of]->(c:Class) return id(x) as id, properties(x) as props, c.name as class;'), 200

    def delete(self, inst_class=None):
        return {'error': 'bulk-delete not supported'}, 405

    def _split_keywords_field(self, kwstring):
        if kwstring is None:
            kwstring = ''
        kwstring = kwstring.strip()
        kwset = set(kwstring.split(','))
        return sorted(list(kwset))

    def post(self, inst_class=None):
        if not inst_class:
            args = self.class_parser.parse_args()
            inst_class = args.class_name
        clsobj = schema.Class.fetch_by_name(inst_class)
        LOG.info('class=%r, fields=%r' % (clsobj, clsobj.fields))
        try:
            field_spec = clsobj.fields
            field_parser = self._get_class_fieldparser(clsobj)
            # LOG.info('parser=%r' % field_parser)
            # LOG.info( 'req=%r, %r' % (request.form, request.json))
            LOG.info('parsing args...')
            new_props = field_parser.parse_args()
            LOG.info('parsed')
        except BadRequest as br:
            LOG.error(type(br))
            br.data['schema'] = field_spec
            raise br
        LOG.info("parsed post args=%r" % new_props)
        # postprocess any args (TODO: put this into the Schema)
        if 'keywords' in new_props:
            if isinstance(new_props['keywords'], basestring):
                new_props['keywords'] = self._split_keywords_field(new_props['keywords'])

        instance = schema.Instance(class_name=clsobj.name, **new_props)
        LOG.info('creating %r' % instance)
        newinst = instance.create()
        # new_id = newinst._id #['inst_id']
        # newinst['inst']['_id'] = new_id
        # newinst['inst']['class_name'] = clsobj.name
        LOG.info('creation produced: %r' % newinst)
        return {'_oid': newinst._oid, '_id': newinst._id, 'props': newinst._get_props(),'class': newinst.instance_of }, 201

        # print 'fieldvals=%r, fieldspec=%r' % (fieldvals, field_spec)
        # return fieldvals, 200


class RelationDetail(Resource):
    def _get_class_fieldparser(self, clsobj):
        parser = reqparse.RequestParser()
        type_map = {'str-long': unicode, 'token': str, 'str': unicode, 'int': int, 'file': str, 'email': unicode }
        for fname, fspec in clsobj.fields.iteritems():
            ftype = type_map[fspec['type']]

            LOG.info('ID: adding field %s, type=%s, req=%s' % (
                fname, fspec['type'], fspec['required']))
            parser.add_argument(fname, location=['json'],
                                type=ftype, required=False)
        return parser

    def get(self, relation_id):
        rel_obj = schema.RelationInstance.fetch_by_id(relation_id)
        if rel_obj:
            return rel_obj, 200
        else:
            return 'Relation not found', 404

    def put(self, relation_id):
        return 'Todo!', 501

    def post(self, relation_id):

        relobj = schema.RelationInstance.fetch_by_id(int(relation_id))
        if relobj is None:
            return {'error': 'Relation with relation_id: {} cannot be found'.format(int(relation_id))}, 404
        rel_class = relobj['class_name']
        relclsobj = schema.RelationClass.fetch_by_name(rel_class)
        try:
            field_spec = relclsobj.fields
            field_parser = self._get_class_fieldparser(relclsobj)
            LOG.info('RD post parser=%r' % field_parser)
            LOG.info( 'RD post req=%r, %r' % (request.form, request.json))
            new_props = field_parser.parse_args()
        except BadRequest as br:
            LOG.error(type(br))
            br.data['schema'] = field_spec
            raise br
        nonempty_props = {k: v for k, v in new_props.iteritems() if v is not None}
        orig_props = copy(dict(relobj))

        # get field(s)
        # do some changes.
        schema.RelationInstance.update_properties(relobj['_id'], nonempty_props)
        newrel = schema.RelationInstance.fetch_by_id(int(relation_id))

        return {'status': 'success', 'req_props': new_props, 'old_props': orig_props, 'new_props': dict(newrel) }, 200

    def delete(self, relation_id):
        ret = schema.RelationInstance.delete_by_id(relation_id)
        return ret  # [dict(r) for r in ret]

class RelationCollection(Resource):
    relation_parser = reqparse.RequestParser(bundle_errors=True)
    relation_parser.add_argument('relation_name', type=str,
                                 location=['form', 'json'], required=True)
    relation_parser.add_argument('src_id', type=int,
                                 location=['form', 'json'], required=True)
    relation_parser.add_argument('dst_id', type=int,
                                 location=['form', 'json'], required=True)
    relation_parser.add_argument('rel_attrs', type=dict,
                                 location=['form', 'json'], required=False, default=lambda: {})
    # relation_parser.add_argument('rel_attrs[value]', type=str, dest='value',
    #                              location=['form', 'json'], required=False)

    def _get_class_fieldparser(self, clsobj):
        parser = reqparse.RequestParser()
        type_map = {'str-long': unicode, 'token': str, 'str': unicode, 'int': int, 'file': str, 'email': unicode }
        for fname, fspec in clsobj.fields.iteritems():
            ftype = type_map[fspec['type']]

            LOG.info('adding field %s, type=%s, req=%s' % (
                fname, fspec['type'], fspec['required']))
            parser.add_argument(fname, location=['json'],
                                type=ftype, required=fspec['required'])
        return parser

    def get(self, rel_class=None):
        return 'Todo!', 501

    def post(self, rel_class=None):
        
        
        LOG.info('request=%r' % request)
        # import ipdb; ipdb.set_trace()
        args = self.relation_parser.parse_args()
        rel_class = args.relation_name
        LOG.info('new relation, args=%r' % repr(args))
        clsobj = schema.RelationClass.fetch_by_name(rel_class)
        LOG.info('relclass=%r, fields=%r, args=%r' % (clsobj, [], args))
        srcobj = schema.Instance.fetch_by_id(args.src_id)
        dstobj = schema.Instance.fetch_by_id(args.dst_id)
        # if args.value is not None:
        #     args.rel_attrs['value'] = args.value
        #     LOG.info('overriding rel_attrs[value] to %s' % args.value)
        ret = schema.Instance.add_relation(srcobj, dstobj, clsobj.name, args.rel_attrs)
        return {'src': srcobj._id, 'dst': dstobj._id, 'rel': ret} , 200

# class ActorCollection(Resource):
#     parser = reqparse.RequestParser()
#     parser.add_argument('name', type=str, required=True)

#     def post(self):
#         args = self.parser.parse_args()
#         actname = args['name'].strip()
#         if not len(actname):
#             return 'name cannot be empty', 400
#         return 'Broken!', 501
#         # ret = create_instance('Actor', {'name': actname})
#         # return ret

#     def get(self):
#         return 'Broken!', 501
#         #return get_instances_of_class('Actor', include_subclasses=False)

# class DocumentCollection(Resource):
#     parser = reqparse.RequestParser()
#     parser.add_argument('name', type=str, required=True)
#     parser.add_argument('file', type=str, required=False)
#     parser.add_argument('class', choices=('NDA', 'SalesContract', 'InfoPack', 'Guidance'),
#                         help="Bad choice: {error_msg}", required=True)
#     parser.add_argument('desc', type=str, required=False)

#     def post(self):
#         args = self.parser.parse_args()
#         docname = args['name']
#         doccls = args['class']
#         docfile = args.get('file', '')
#         docdesc = args.get('desc', '')
#         return 'Broken!', 501
#         #ret = create_instance(doccls, {k: args[k] for k in ['name', 'file', 'desc']})
#         #return ret

#     def get(self):
#         return 'Broken!', 501
#         #return get_instances_of_class('Document', include_subclasses=True)

# class DocumentActorBinding(Resource):
#     parser = reqparse.RequestParser()
#     parser.add_argument('role_id', type=int, required=True)
#     parser.add_argument('actor_id', type=int, required=True)

#     def post(self, doc_id):
#         args = self.parser.parse_args()
#         return 'Broken!', 501
#         role_ob = get_id_for_instance(id=int(args['role_id']), classname='FirstPartyRole')
#         actor_ob = get_id_for_instance(id=int(args['actor_id']), classname='Actor')
#         print role_ob
#         print actor_ob
#         try:
#             ret = add_binding(actor_ob['inst_id'], int(doc_id), role_ob['inst_id'])
#             return [list(r.result.records()) for r in ret.results]
#         except Exception as e:
#             return e, 400
class InstanceGraphClass(Resource):
      def get(self):
          print "====cc===",request.args.get('name')
          if request.args.get('name') == "undefined":
             return;
          return graph.get_instance_graph(name=request.args.get('name'))
      def post(self):
        print "api ================called"
        reqdata = request.json
        print "=========",reqdata
        return graph.get_instance_graph(name=reqdata["className"])
class GraphClassNode(Resource):
      def get(self):
          reqdata = request.json
          print "================in get request=========="
          return graph.getNodeByClass(nodename=request.args.get('nodeName'),className=request.args.get('className'))
      def post(self):
        print "api ================called"
        reqdata = request.json
        return graph.getNodeByClass(nodename=reqdata["nodeName"],className=reqdata["className"])

class InstanceGraph(Resource):
    def get(self):
        print "api ================called"
        
        return graph.build_instance_graph().as_dict()


class SchemaGraph(Resource):
    def get(self):
        #print graph.build_schema_graph().as_dict()
        return graph.build_schema_graph().as_dict()
    def post(self):
        LOG.warn('schemagraph POST')
        parser = reqparse.RequestParser()
        reqdata = request.json
        print "reqdata",reqdata
        if reqdata:
           oid=reqdata["_oid"] 
           name=reqdata["name"]
        #scope=['admin', 'editor']
           supercls=reqdata["supercls"]
           colour=reqdata["colour"]
           desc=reqdata["desc"]
           fields=reqdata["fields"]
        childObject=','.join(['%s="%s"'%x for x in request.json.items()])
        print "=========",childObject
        parser.add_argument('magic', type=str, required=False)
        args = parser.parse_args()
        if True or args and args.magic and args.magic == 'REALLYDESTROYALLTHETHINGS':
            LOG.warn('schema destruction initiated')
            try:
                LOG.warn('here we go')
                fixture.destroy_and_refixture()
                fixture.create_child(oid,name,supercls,colour,desc,fields)
                print "===============child class called========"
                LOG.warn('creating instances')
                #fixture.create_instances()
                return {'status': 'success'}, 200
            except Exception as e:
                LOG.exception(e)
                return {'status': 'failed', 'reason': repr(e)}, 500
        else:
            return {'status': 'failed', 'reason': 'incorrect magic supplied'}, 400


class SchemaGraphDelete(Resource):
      def post(self):
          reqdata = request.json
          graph.deleteChildClass(reqdata.get("class_name"))
          fixture.destroy_and_refixture()
class GraphExport(Resource):
    def get(self):
        nodes = graph.dump_graph_nodes()
        edges = graph.dump_graph_edges()

        return { 'nodes': nodes, 'edges': edges }, 200

class GraphImport(Resource):
    def post(self):
        reqdata = request.json
        print "======reqdata===========================",
        print "===============",reqdata
        #LOG.debug('reqdata = %s' % type(reqdata))
        #if (type(reqdata) == unicode):
        #    import ipdb; ipdb.set_trace()
        new_nodes = reqdata.get('nodes', [])
        new_edges = reqdata.get('edges', [])
        LOG.debug('importing {} nodes, {} edges'.format(len(new_nodes), len(new_edges)))

        if not len(new_nodes):
            return '"nodes" list not supplied or empty', 400
        if not len(new_edges):
            return '"edges" list not supplied or empty', 400
        # import pdb
        # pdb.set_trace()

        #graph.db_handle().delete_all()
        LOG.debug('deleted existing nodes')
        graph.load_graph_nodes(new_nodes)
        LOG.debug('loaded new nodes')
        graph.load_graph_edges(new_edges)
        LOG.debug('loaded new edges')
        errs = graph.schema_check()
        LOG.debug('import errors=%r' % (errs,))
        return 'import: %r' % errs, 200

    def get(self):
        reqdata = ''
        return 'import: %r' % reqdata, 200
class DomainImport(Resource):
      def post(self):
        reqdata = request.json
        new_nodes = reqdata.get('nodes', [])
        new_edges = reqdata.get('edges', [])
        LOG.debug('importing {} nodes, {} edges'.format(len(new_nodes), len(new_edges)))
        if not len(new_nodes):
            return '"nodes" list not supplied or empty', 400
        if not len(new_edges):
            return '"edges" list not supplied or empty', 400
        # import pdb
        # pdb.set_trace()

        #graph.db_handle().delete_all()
        LOG.debug('deleted existing nodes')
        graph.load_graph_nodes(new_nodes)
        LOG.debug('loaded new nodes')
        graph.load_graph_edges(new_edges)
        LOG.debug('loaded new edges')
        #fixture.destroy_and_refixture()
        errs = graph.schema_check()

        LOG.debug('import errors=%r' % (errs,))
        return 'import: %r' % errs, 200
class RelationLabels(Resource):

    def get(self):
        return graph.get_relation_instance_labels()


class InstanceLabels(Resource):

    def get(self):
        return graph.get_instance_labels()


class UserAuth(Resource):

    def get(self):
        confirmed=False
        LOG.debug('authcheck, req.authz=%r' % request.authorization)
        try:
            username = request.authorization.get('username')
        except:
            username = request.headers.get('x-remote-user') or 'unknown'

        LOG.debug('extracted user=%r' % username)

        try:
            usergroup = (username or '').split('-', 1)[1]
            confirmed = True
        except IndexError:
            usergroup = 'viewer'

        if usergroup not in { 'viewer', 'editor', 'admin' }:
            usergroup = 'viewer'
            confirmed = False

        return {
            'username': username,
            'usergroup': usergroup,
            'confirmed': confirmed
        }, 200

    # def get(self):
    #     LOG.debug('authcheck, req.authz=%r' % request.authorization)
    #     try:
    #         username = request.authorization.get('username')
    #     except:
    #         username = request.headers.get('x-remote-user') or 'unknown'

    #     usergroup = (username or '').split('-', 1)[0]

    #     confirmed = True
    #     if usergroup not in { 'viewer' , 'editor', 'admin' }:
    #         usergroup = 'viewer'
    #         confirmed = False

    #     return {
    #         'username': username,
    #         'usergroup': usergroup,
    #         'confirmed': confirmed
    #     }, 200


# /instance/ POST _ create a new thing
# * /class/ POST - create new class
# /instance/:id/ POST/PUT to modify a thing
# /instance/:id/ DELETE - remove a thing?
# /class/:id|:name/ GET - get props/schema for a class?
# Any: required(name)
# Actor: required(address)
#        optional(postcode)
#  -> name, addr, postcode

# instance editing form requires:
# - what fields
# - type of each field
# - modify url
#  - can guess?
# - current values if editing

# realtion editing/creation:
# - determine valid relation types?
#  - by looking at schema-graph, or querying if one node is known
#  - check :isa hierarchy for domain/range
#  - relation attrs if specified
#  - create (post to /relation/ {class=..., src=..., dst=...}
#  - refresh graphs
# /relation/:id/
# instance property view sidebar
# - info about current highlighted thing (intance or class?)
# - maybe also what relations in/out are allowed? (link/button to create?)
# - maybe also what relations in/out are present? (and attrs on them if they have?)
# deleting instances + associated relinstances?
# match (x:Instance)-[:to|from]-(ri:RelationInstance)-[:to|from]-(:Instance) where id(x) = {x_id} detach delete x, ri;
#api.add_resource(NodeInstance, '/node/<node_id>')

#################################################################################

# api.add_resource(ActorCollection, '/actors')
# api.add_resource(DocumentCollection, '/documents')
# api.add_resource(DocumentActorBinding, '/documents/<int:doc_id>/bindings')
api.add_resource(UserAuth, '/auth')


#api.add_resource(AuthCheck, '/auth')
api.add_resource(InstanceGraph, '/graph')
# api.add_resource(InstanceGraphClass, '/GraphByClass')GraphClassNode
api.add_resource(InstanceGraphClass, '/GraphByClass','/<string:name>/')
api.add_resource(GraphClassNode, '/GraphClassNode','/<string:name>/')
api.add_resource(SchemaGraph, '/schema/graph')
api.add_resource(SchemaGraphDelete, '/schema/graph/deleteClass')

api.add_resource(GraphExport, '/export/_graph')
api.add_resource(GraphImport, '/import/_graph')
api.add_resource(DomainImport, '/import/domains')

api.add_resource(RelationLabels, '/relation/labels')
api.add_resource(InstanceLabels, '/labels')

api.add_resource(InstanceCollection, '/instances/', '/instances/<string:inst_class>/')
api.add_resource(InstanceDetail, '/instances/<int:instance_id>/')

api.add_resource(RelationCollection, '/relations/', '/relations/<string:rel_class>/')
api.add_resource(RelationDetail, '/relations/<int:relation_id>/')

def main(reloadp=False, debug=False):
    logging_tree.printout()
    LOG.warn("Running server")
    app.run(debug=debug, use_reloader=reloadp, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    import sys
    args = sys.argv[:]
    LOG.warn("Args: %r" % args)
    debug = '-debug' in args
    reloadp = '-noreload' not in args
    if '-api' in args:
        main(reloadp=reloadp, debug=debug)
