
from datetime import date
import datetime as dt
from marshmallow import Schema, pprint, post_load, pre_load, pre_dump
from marshmallow import fields as mm_fields
import json
from copy import copy
from knowledge import graph
import logging
LOG = logging.getLogger(__name__)
import uuid

def uuid_edgehash(src_oid, dst_oid):
    """generates a consistent hash value from 2 OIDs for persisting
    'relationship nodes' between identified endpoints"""
    src_uuid = uuid.UUID(src_oid)
    dst_uuid = uuid.UUID(dst_oid)

    src_ba = bytearray(src_uuid.get_bytes())
    dst_ba = bytearray(dst_uuid.get_bytes())

    dst_rev = reversed(dst_ba)
    hashed_ba = bytearray(a ^ b for a, b in zip(src_ba, dst_ba))
    edge_hash = uuid.UUID(bytes=str(hashed_ba))
    return edge_hash


class FieldSpecSchema(Schema):
    pass


class AbstractClassSchema(Schema):


    _id = mm_fields.Integer(required=True)
    _oid = mm_fields.Str(required=True)
    _labels = mm_fields.List(mm_fields.Str())
    name = mm_fields.Str()
    supercls = mm_fields.Str(missing=None)

    fields = mm_fields.Dict(required=False, default=lambda: {})
    scope = mm_fields.List(mm_fields.Str(), required=False)
    created_at = mm_fields.DateTime(required=False)
    colour = mm_fields.Str(required=False, default="#CCCCCC")
    desc = mm_fields.Str(required=False, default='No Description Provided')

class ClassSchema(AbstractClassSchema):
    @pre_load
    def fields_fromjson(self, data):
        if 'fields' in data:
            newdata = dict(data)

            newdata['fields'] = json.loads(data['fields'])
            #print 'FJ: fields now=%r' % newdata
            return newdata
        return data

    @pre_dump
    def fields_tojson(self, data, many):
        if 'fields' in data:
            newdata = copy(data)
            newdata['fields'] = json.dumps(data['fields'])
            #print 'TJ: fields now=%r' % newdata
            return newdata
        return data

    @post_load
    def make_class(self, data):
        # TODO: hacky, should be explicit in schema/obj.
        return Class(**data)

class RelationClassSchema(AbstractClassSchema):
    domain = mm_fields.Str()
    range = mm_fields.Str()

    @pre_load
    def fields_fromjson(self, data):
        if 'fields' in data:
            newdata = dict(data)
            newdata['fields'] = json.loads(data['fields'])
            print 'FJ: fields now=%r' % newdata
            return newdata
        return data

    @pre_dump
    def fields_tojson(self, data, many):
        if 'fields' in data:
            newdata = copy(data)
            newdata['fields'] = json.dumps(data['fields'])
            print 'TJ: fields now=%r' % newdata
            return newdata
        return data

    @post_load
    def make_relationclass(self, data):
        return RelationClass(**data)

class AbstractClass(object):

    _type = 'ABSTRACT'
    _schematype = ClassSchema
    _fetch_fields = [
                ['cls', 'cls'],
                ['id(cls)', 'cls_id'],
                ['labels(cls)', 'labels'],
                ['supercls.name', 'supercls']]

    @classmethod
    def get_schema(cls):
        if getattr(cls, '_schema', None) is None:
            setattr(cls, '_schema', cls._schematype())
        return cls._schema

    @classmethod
    def _fetch(cls, match_spec, params=None):
        if params is None:
            params = {}
        query = graph.construct_query(match_spec=match_spec,
                                                 return_spec=cls._fetch_fields)
        qret = graph.query(query, **params)
        return qret

    @classmethod
    def fetch_by_name(cls, name):
        qret = cls._fetch(
            match_spec=[
                ['match', '(cls:%s)' % cls._type, 'cls.name = $name'],
                ['optional match', '(cls)-[:isa]->(supercls:%s)' % cls._type, None]],
            params={'name': name})

        if len(qret) == 0:
            return None

        if len(qret) > 1:
            raise ValueError('%s.fetch_by_name returned more than 1 result'%cls._type, qret)

        row = qret[0]
        clsdata = copy(dict(row['cls']))
        clsdata['_id'] = row['cls_id']
        clsdata['_labels'] = row['labels']
        clsdata['supercls'] = dict(row['supercls']).get('name')

        LOG.debug('loading %r' % clsdata)
        obj = cls.get_schema().load(clsdata)
        if obj.errors:
            raise ValueError('error objectifying', obj.errors)
        return obj.data

    @classmethod
    def fetch_by_id(cls, id):
        params = {'id': id}
        qret = cls._fetch(
            match_spec=[
                ['match', '(cls:%s)'%cls._type, 'id(cls) = {id}'],
                ['optional match', '(cls)-[:isa]->(supercls:%s)'%cls._type, None]],
            params=params)

        if len(qret) == 0:
            return None

        if len(qret) > 1:
            raise ValueError('%s.fetch_by_name returned more than 1 result' % cls._type,
                             qret)

        row = qret[0]

        clsdata = row['cls']
        clsdata['_id'] = row['cls_id']
        clsdata['_labels'] = row['labels']
        clsdata['supercls'] = row['supercls']
        return cls.get_schema().load(clsdata).data


    @classmethod
    def _fetch_all(cls):
        qret = cls._fetch(match_spec=[
            ['match', '(cls:%s)'%cls._type, None],
            ['optional match', '(cls)-[:isa]->(supercls:%s)'%cls._type, None]])
        objs = []
        for row in qret:
            clsdata = row['cls']
            clsdata['_id'] = row['cls_id']
            clsdata['_labels'] = row['labels']
            clsdata['supercls'] = row.get('supercls', None)
            objs.append(clsdata)
        deserialised = cls.get_schema().load(objs, many=True)
        if not deserialised.errors:
            return deserialised.data
        else:
            raise ValueError('error deserialising', deserialised.errors)

    @classmethod
    def fetch_all(cls):
        return cls._fetch_all()

    def __init__(self, name, **kwargs):

        self.name = name
        self._id = kwargs.get('_id', None)
        self._oid = kwargs.get('_oid', None)
        self._labels = kwargs.get('_labels', [])
        self.created_at = dt.datetime.now()
        self._global = kwargs.get('_global', False)

    def create(self, _global=False):
        if self.supercls is not None:
            create_query = """
            MATCH (supercls:%s {name: $supername})
            MERGE  (cls:Thing:`%s` {name: $clsname})
             SET cls += $props
            MERGE (cls)-[:isa]->(supercls)
            WITH cls
            CALL apoc.create.addLabels(cls, $clslabels) YIELD node AS n_cls
            RETURN id(n_cls) as cls_id;
            """%(self._type, self._type)
        else:
            create_query = """
            MERGE (cls:Thing:`%s` {name: $clsname})
             SET cls += $props
            WITH cls
            CALL apoc.create.addLabels(cls, $clslabels) YIELD node AS n_cls
            RETURN id(n_cls) as cls_id;
            """ % self._type

        obj_props = self._get_props()
        obj_labels = [self.name]
        
        is_global = _global or self._global
        print "is---->",is_global
        if is_global:
            obj_labels.append('Global')
            assert obj_props['_oid'] is not None
        else:
            obj_labels.append('Local')
            obj_props.setdefault('_oid', str(uuid.uuid4()))
        

        qret = graph.query(create_query,
                           supername=self.supercls,
                           clslabels=obj_labels,
                           clsname=self.name,
                           props=self._get_props())
        
        #assert len(qret) == 1
        self._id = qret[0]['cls_id']
        return qret

    def __repr__(self):
        return '<{self._type} (name={self.name}, id={self._id})>'.format(self=self)

class Class(AbstractClass):
    _type = 'Class'
    _schematype = ClassSchema
    def _get_props(self):
        return {
            '_oid': self._oid,
            'scope': self.scope,
            'fields': json.dumps(self.fields),
            'colour': self.colour,
            'desc': self.desc,
            'test':self.test
        }

    def __init__(self, name, **kwargs):
        #self.name = name
        super(Class, self).__init__(name, **kwargs)

        # self._id = kwargs.get('_id', None)
        # self._global = kwargs.get('global', False)
        # self._labels = kwargs.get('_labels', [])

        self.scope = kwargs.get('scope', [])
        self.supercls = kwargs.get('supercls', 'Any')
        self.fields = kwargs.get('fields', {})
        self.created_at = dt.datetime.now()
        self.colour = kwargs.get('colour', '#cccccc')
        self.desc = kwargs.get('desc', 'no description')
        self.test = kwargs.get('test', '')

    @classmethod
    def fetch_by_name(cls, name):
        # qret = cls._fetch(
        #     match_spec=[
        #         ['match', '(cls:%s)' % cls._type, 'cls.name = {name}'],
        #         ['optional match', '(cls)-[:isa]->(supercls:%s)' % cls._type, None]],
        #     params={'name': name})

        # TODO: fix this to use the schema better and work for other fetch_* methods as well.
        qret = graph.query("""
        MATCH (cls:Class {name: $clsname})
        OPTIONAL MATCH isa=(cls)-[:isa*1..10]->(_supercls:Class {name: "Any"})
        WITH cls, isa, extract(n IN nodes(isa) | n.scope) AS thing
        WITH cls, isa, filter(x IN thing WHERE size(x) > 0) AS clean
        RETURN cls, id(cls) as cls_id,
        labels(cls) as labels,
        nodes(isa)[1] as supercls,
        [isa_n in nodes(isa) where exists(isa_n.fields) | isa_n.fields] as isa_fields,
        coalesce(head(clean), []) as isa_scope;
        """, clsname=name)

        if len(qret) == 0:
            return None
        print "=================qurrr===",qret
        # if len(qret[0]) > 1:
        #     raise ValueError('%s.fetch_by_name returned more than 1 result'%cls._type, qret)

        row = qret[0]
        clsdata = copy(dict(row['cls']))
        clsdata['_id'] = row['cls_id']
        clsdata['_labels'] = row['labels']
        clsdata['supercls'] = dict(row['supercls']).get('name')
        LOG.debug('clsdata=%r' % clsdata)
        if clsdata.get('fields', None) is not None:
            #print 'fields=%r' % clsdata['fields']
            try:
                fieldata = json.loads(clsdata['fields'])
            except:
                fieldata = None

        if not fieldata:
            # walk the isa hierarchy and look for field defs
            for parent_fieldspec in row['isa_fields'] or []:
                if parent_fieldspec and json.loads(parent_fieldspec):
                    clsdata['fields'] = parent_fieldspec
                    break

        LOG.debug('loading %r' % clsdata)
        obj = cls.get_schema().load(clsdata)
        if obj.errors:
            raise ValueError('error objectifying', obj.errors)
        return obj.data

class RelationClass(AbstractClass):
    _type = 'RelationClass'
    _schematype = RelationClassSchema
    _fetch_fields = [
        ['cls', 'cls'],
        ['id(cls)', 'cls_id'],
        ['labels(cls)', 'labels'],
        ['supercls', 'supercls'],
        ['id(supercls)', 'supercls_id'],

        ['domcls.name', 'domcls'], ['rangecls.name', 'rangecls'],
    ]

    def _get_props(self):
        return {
            '_oid': self._oid,
            'scope': self.scope,
            'desc': self.desc,
            'fields': json.dumps(self.fields),
        }

    def __init__(self, **kwargs):
        #print 'RC init with kwargs=%s' % kwargs

        super(RelationClass, self).__init__(**kwargs)
        if self.name == 'RelatedTo':
            self.supercls = None
        else:
            self.supercls = kwargs.get('supercls', 'RelatedTo')

        self.scope = kwargs.get('scope', [])
        self.domain = kwargs.get('domain', 'Any')
        self.range = kwargs.get('range', 'Any')
        self.desc = kwargs.get('desc', 'no description')
        self.fields = kwargs.get('fields', {})

    def create(self, _global=False):
        if self.supercls is not None:
            create_query = """
            MATCH (supercls:`%s` { name: $supername }),
              (domcls:Class { name: $domname }),
              (rangecls:Class { name: $rangename })
            MERGE (relcls:Thing:`%s` { name: $clsname })-[:isa]->(supercls)
             SET relcls += $props
            MERGE (relcls)-[:domain]->(domcls)
            MERGE (relcls)-[:range]->(rangecls)
            WITH relcls
             CALL apoc.create.addLabels(relcls, $cls_labels) YIELD node AS n_rel
             RETURN id(n_rel) as relcls_id;
            """%(self._type, self._type)
        else:
            create_query = """
            MATCH (domcls:Class { name: $domname }), (rangecls:Class { name: $rangename })
            MERGE (relcls:Thing:`%s` { name: $clsname })
             SET relcls += $props
            MERGE (relcls)-[:domain]->(domcls)
            MERGE (relcls)-[:range]->(rangecls)
            WITH relcls
             CALL apoc.create.addLabels(relcls, $cls_labels) YIELD node AS n_rel
             RETURN id(n_rel) as relcls_id;
            """ % self._type

        #print 'query=%s' % create_query

        obj_props = self._get_props()
        obj_labels = [self.name]

        is_global = _global or self._global

        if is_global:
            obj_labels.append('Global')
            assert obj_props['_oid'] is not None
        else:
            obj_labels.append('Local')
            obj_props.setdefault('_oid', str(uuid.uuid4()))


        qret = graph.query(create_query,
                           supername=self.supercls,
                           cls_labels=obj_labels,
                           clsname=self.name,
                           domname=self.domain,
                           rangename=self.range,
                           props=self._get_props())
        #assert len(qret) == 1
        self._id = qret[0]['relcls_id']
        return qret


    @classmethod
    def _fetch_all(cls):
        qret = cls._fetch(match_spec=[
            ['match', '(cls:%s), (cls)-[:domain]->(domcls:Class), (cls)-[:range]->(rangecls:Class)'%cls._type, None],
            ['optional match', '(cls)-[:isa]->(supercls:%s)'%cls._type, None],

        ])
        objs = []
        for row in qret:
            clsdata = row['cls']
            clsdata['_id'] = row['cls_id']
            clsdata['_labels'] = row['labels']

            clsdata['supercls'] = dict(row.get('supercls', {})).get('name', None)
            clsdata['domain'] = row['domcls']
            clsdata['range'] = row['rangecls']
            objs.append(clsdata)
        deserialised = cls.get_schema().load(objs, many=True)
        if not deserialised.errors:
            return deserialised.data
        else:
            raise ValueError('error deserialising', deserialised.errors)

    @classmethod
    def fetch_by_name(cls, name):
        qret = cls._fetch(match_spec=[
            ['match', '(cls:%s {name: {relclsname}}), (cls)-[:domain]->(domcls:Class), (cls)-[:range]->(rangecls:Class)'%cls._type, None],
            ['optional match', '(cls)-[:isa]->(supercls:%s)'%cls._type, None],
        ], params={'relclsname': name})

        row = qret[0] # TODO: check empty
        clsdata = copy(dict(row['cls']))
        clsdata['_id'] = row['cls_id']
        clsdata['_labels'] = row['labels']

        #clsdata['supercls'] = row.get('supercls', None)
        supercls = row.get('supercls', {})
        if supercls is None:
            supercls = {}
        clsdata['supercls'] = dict(supercls).get('name', None)
        clsdata['domain'] = row['domcls']
        clsdata['range'] = row['rangecls']
        if 'fields' not in clsdata or clsdata['fields'] is None:
            clsdata['fields'] = '{}'
        # if clsdata.get('fields', None) is not None:
        #     #print 'fields=%r' % clsdata['fields']
        #     try:
        #         fieldata = json.loads(clsdata['fields'])
        #     except:
        #         fieldata = { 'nosuchfields': {}}
        #     clsdata['fields'] = fieldata

        # if not fieldata:
        #     # walk the isa hierarchy and look for field defs
        #     for parent_fieldspec in row['isa_fields'] or []:
        #         if parent_fieldspec and json.loads(parent_fieldspec):
        #             clsdata['fields'] = parent_fieldspec
        #             break

        deserialised = cls.get_schema().load(clsdata, many=False)
        if not deserialised.errors:
            return deserialised.data
        else:
            raise ValueError('error deserialising', deserialised.errors)

class Instance(object):
    _type = 'Instance'

    def __init__(self, **kwargs):
        self._id = None
        self.instance_of = kwargs.pop('class_name', self._type)
        self._oid = kwargs.get('_oid', None)
        self._global = kwargs.get('_global', False)

        self.name = kwargs.pop('name', None)

        for k,v in kwargs.iteritems():
            setattr(self, k, v)

        # TODO: check class schema for field defns and enforce name present if required/unique.

    def __repr__(self):
        return '<{self.instance_of} (name={self.name}, id={self._id})>'.format(self=self)
    def _get_props(self):
        ret = { '_oid': self._oid }
        #LOG.warn('props: %r' % self.__dict__)
        if self.name:
            ret['name'] = self.name
        clsobj = Class.fetch_by_name(self.instance_of)
        fieldspec = clsobj.fields or {}
        for fname in fieldspec.keys():

            fprop = getattr(self, fname, None)
            LOG.debug('checking %s (%s)' % (fname, fprop))
            if fprop is not None:
                ret[fname] = fprop
        LOG.debug('props for %r: %r' % (self, ret))
        return ret

    @classmethod
    def fetch_by_id(cls, inst_id):
        ret = graph.query("""
        MATCH (x:Instance)-[:instance_of]->(cx:Class)
        WHERE id(x) = $inst_id
        RETURN x, cx, id(x) as x_id LIMIT 1;
        """, inst_id=inst_id)
        # TODO: parse/objectify this with a schema
        if len(ret):
            raw_obj = ret[0]['x']
            obj = Instance(class_name=dict(ret[0]['cx'])['name'], **dict(raw_obj))
            #obj.class_name = dict(ret[0]['cx'])['name']
            obj._id = ret[0]['x_id']

            return obj
        else:
            LOG.debug( 'no Instance found for id: ', inst_id)
            return None

    @classmethod
    def delete_by_id(cls, inst_id):
        ret = graph.query('''
        MATCH (x:Instance) WHERE id(x) = $inst_id
        OPTIONAL MATCH (x)-[:to|from]-(ri:RelationInstance)-[:to|from]-()
        DETACH DELETE x, ri;
        ''', inst_id=inst_id)
        return ret

    @classmethod
    def update_properties(cls, inst_id, new_props):
        assert inst_id is not None
        assert inst_id > 0
        assert '_oid' not in new_props # don't allow changing IDs of things

        ret = graph.query('''
        MATCH (x:Instance) WHERE id(x) = $inst_id
        SET x += $new_props
        RETURN x;
        ''', inst_id=inst_id, new_props=new_props)
        return ret

    def delete(self):
        assert self._id is not None
        return self.delete_by_id(self._id)

    def create(self, _global=False):
        query = """
        MATCH (cls:Class { name: $cls_name })
        MERGE (inst:Thing:Instance { _oid: $inst_oid })-[:instance_of]->(cls)
         SET inst = $inst_props
        WITH cls, inst
         CALL apoc.create.addLabels(inst, $inst_labels) YIELD node as n_inst
         RETURN id(n_inst) as inst_id, n_inst as inst;
        """
        obj_props = self._get_props()
        obj_labels = [self.instance_of]

        is_global = _global or self._global

        if is_global:
            obj_labels.append('Global')
            assert obj_props['_oid'] is not None
        else:
            obj_labels.append('Local')
            if obj_props.get('_oid', None) is None:
                obj_props['_oid'] = str(uuid.uuid4())

        qret = graph.query(query,
                           inst_oid=obj_props['_oid'],
                           cls_name=self.instance_of,
                           inst_labels=obj_labels,
                           inst_props=obj_props)
        assert len(qret) == 1
        retobj = qret[0]['inst']
        self._id = qret[0]['inst_id']
        self._oid = retobj['_oid']
        LOG.debug('oid set to %r (retob=%r)' % (self._oid, retobj))
        return self

    @classmethod
    def add_relation(cls, src, dst, rel_class, rel_attrs=None, _global=False):
        query = """
        MATCH (src:Instance) WHERE id(src) = $src_id
        MATCH (dst:Instance) WHERE id(dst) = $dst_id
        MATCH (relcls:RelationClass { name: $rel_clsname })
        MERGE (src)-[:from]->(rel:Thing:RelationInstance:`%s`)-[:to]->(dst)
         ON CREATE SET rel += $rel_attrs
         ON MATCH SET rel += {clobbered: true}
        MERGE (rel)-[:instance_of]->(relcls)
        WITH src, dst, rel
         CALL apoc.create.addLabels(rel, [ $rel_clsname ]) YIELD node AS n_rel
         RETURN src, dst, n_rel;
        """ % (rel_class)

        # TODO: handle _global here properly

        assert src._id is not None
        assert dst._id is not None
        if rel_attrs is None:
            rel_attrs = {}

        assert src._oid is not None
        assert dst._oid is not None

        rel_attrs.setdefault('_oid', str(uuid_edgehash(src._oid, dst._oid)))

        LOG.debug('add-relation, query=%r'%query)
        qret = graph.query(query,
                           src_id=src._id,
                           dst_id=dst._id,
                           rel_attrs=rel_attrs,
                           rel_clsname=rel_class)
        LOG.debug('add-relation returned=%r'% qret)
        return qret


    @classmethod
    def delete_relation(cls, src, dst, rel_class):
        # DETACH DELETE RelationInstance matching the above attrs.
        # maybe find it by ID?
        pass

    def add_subjectof_rel(self, subj, rel_attrs=None, rel_class='SubjectOf'):
        return self.add_relation(self, subj, rel_class, rel_attrs)

    def add_objectof_rel(self, obj, rel_attrs=None, rel_class='ObjectOf'):
        return self.add_relation(self, obj, rel_class, rel_attrs)

    def add_hastopic_rel(self, topic, rel_attrs=None, rel_class='HasTopic'):
        return self.add_relation(self, topic, rel_class, rel_attrs)

class RelationInstance(object):
    @classmethod
    def fetch_by_id(cls, relinst_id):
        ret = graph.query("""
        MATCH (x:RelationInstance)-[:instance_of]->(cx:RelationClass)
        WHERE id(x) = $rel_id
        OPTIONAL MATCH (x)<-[:from]-(from:Instance)-[:instance_of]->(fromcls:Class),
         (x)-[:to]->(to:Instance)-[:instance_of]->(tocls:Class)
        RETURN x, cx, id(x) as x_id,
               from, id(from) as from_id, to, id(to) as to_id,
               fromcls.name as from_cls, tocls.name as to_cls
        LIMIT 1
        """, rel_id=relinst_id)
        # TODO: parse/objectify this with a schema
        if len(ret):
            row = ret[0]
            rel_obj = copy(dict(row['x']))
            rel_obj['class_name'] = dict(row['cx'])['name']
            rel_obj['_id'] = row['x_id']
            rel_obj['dst'] = { '_id': row['to_id'], 'class': row['to_cls'] }
            rel_obj['src'] = { '_id': row['from_id'], 'class': row['from_cls'] }
            return rel_obj
        else:
            print 'no RelationInstance found for id: ', relinst_id
            return None

    @classmethod
    def delete_by_id(cls, rel_id):
        ret = graph.query('''
        MATCH (x:RelationInstance)-[:instance_of]->(xcls:RelationClass)
         WHERE id(x) = $rel_id
        OPTIONAL MATCH (x)-[:to]->(to_inst), (x)<-[:from]-(from_inst)
        DETACH DELETE x
        RETURN to_inst, id(to_inst) as to_id, xcls.name as relcls_name, from_inst, id(from_inst) as from_id;''', rel_id=rel_id)
        return ret

    @classmethod
    def update_properties(cls, rel_id, new_props):
        query = '''
        MATCH (r:RelationInstance) WHERE id(r) = {rel_id}
        SET r += {new_props}
        RETURN r;
        '''

        assert rel_id > 0
        ret = graph.query(query, rel_id=rel_id, new_props=new_props)
        return ret

    def update(self, new_props):
        assert self._id is not None
        return self.update_relation(new_props)

    def delete(self):
        assert self._id is not None
        return self.delete_by_id(self._id)

class Topic(Instance):
    _type = 'Topic'

    def add_subtopic(self, subtopic_node):
        return self.add_relation(self, subtopic_node, rel_class='HasSubTopic', rel_attrs={})

class Actor(Instance):
    _type = 'Actor'

class Action(Instance):
    _type = 'Action'

class Term(Instance):
    _type = 'Term'

class Obligation(Term):
    _type = 'Obligation'

    def __init__(self, **kwargs):
        self.role = kwargs.pop('role', None)
        self.action = kwargs.pop('action', None)
        super(Obligation, self).__init__(**kwargs)

    def create(self):
        # TODO: txn
        ret = super(Obligation, self).create()
        if self.role:
            self.add_subjectof_rel(self.role)
        if self.action:
            self.add_objectof_rel(self.action)
        return ret

class Document(Instance):
    _type = 'Document'

class Agreement(Document):
    _type = 'Agreement'

    def add_hasterm_rel(self, term):
        return self.add_relation(self, term, rel_class='HasTerm')

    def add_binding(self, role, actor):
        # create binding b
        # TODO: transaction for this.
        binding = Instance(class_name='Binding')
        binding.create()

        # add rel for b-bindsrole-role
        binding.add_relation(binding, role, rel_class='BindsRole')
        # add rel for b-boundto-actor
        binding.add_relation(binding, actor, rel_class='BoundTo')
        # add rel for b-definedin-doc (self)
        binding.add_relation(binding, self, rel_class='DefinedIn')
        return binding

# if __name__ == '__main__':
#     c = Class(name='test', fields=dict(a=1,b=2), scope=[], _id=123, _labels=['Class'])
#     sc = ClassSchema()

#     c_json = sc.dumps(c).data
#     print c_json

#     new_c = sc.loads(c_json)
#     print new_c.data
