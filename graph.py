import logging
import logging_tree
from datetime import datetime
import itertools
from copy import copy
import json
import os
LOG = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

import py2neo
from py2neo import remote, Node, Relationship, Subgraph

#logging.getLogger('neo4j.bolt').setLevel(logging.WARN)
bolt_logstr = os.environ.get('PY2NEO_BOLTLOGGING', 'WARN')
bolt_loglevel = getattr(logging, bolt_logstr, logging.WARN)
logging.getLogger('neo4j.bolt').setLevel(bolt_loglevel)

class Graph(object):
    def __init__(self, use_colours=True):
        self.nodes = {}
        self.edges = {}
        if use_colours:
            self.node_colours = {
                "Topic": "#00FF00",
                "Role": "#FF0000",
                "FirstPartyRole": "#de1212",
                "ThirdPartyRole": "#9a2828",
                "Actor": "#336600",
                "Obligation": "#663300",
                "Agreement": "#00F",
                "InfoPack": "#00F",
                "Guidance": "#00F",
                "NDA": "#009999",
                "Document": "#990099",
                "Party": "#0099FF",
                "_default": "#CCCCCC",
            }
        else:
            self.node_colours = {}

    def getNode(self, node_id):
        node = self.nodes.get(node_id)
        # don't try to add an additional colour attr if the list is empty
        if len(self.node_colours):
            node['colour'] = self.getNodeColour(node_id)
        return node

    def getNodeColour(self, node_id):
        node = self.nodes.get(node_id)
        #print 'nodedict=%r' % dict(node)
        node_colour = dict(node).get('props', {}).get('colour', None)
        if node_colour is not None:
            return node_colour

        colours = [self.node_colours.get(n) for
                   n in itertools.chain([node['class']], ['_default'])]

        return next(c for c in colours if c is not None)

    def setNode(self, id, data):
        self.nodes[id] = data

    def setEdge(self, sourceid, targetid, kind, data):
        self.edges[(sourceid, targetid, kind)] = data

    def getLabels(self):
        return set(itertools.chain.from_iterable(n['labels'] for
                                                 n in self.nodes.values()))

    def as_json(self):
        return json.dumps(self.as_dict(), separators=(',', ': '), indent=2)


    def as_dict(self):
        return {
            'nodes': [self.getNode(nid) for nid in self.nodes.keys()],
            'edges': self.edges.values(),
            'node_types': list(self.getLabels()),
        }

def db_handle():
    # requires py2neo>=4.0.0b2 to work properly.
    # default_bolturi = 'bolt://127.0.0.1:27687/db/data/'
    # default_httpuri = 'http://127.0.0.1:27474/db/data/'
    default_bolturi = 'bolt://127.0.0.1:7687/db/data/'
    default_httpuri = 'http://127.0.0.1:7474/db/data/'
    #default_graphuri = ''
    bolt_uri = os.environ.get('OS_NEO4J_HTTP_URL', default_httpuri)
    http_uri = os.environ.get('OS_NEO4J_BOLT_URL', default_bolturi)
    neo_user = os.environ.get('OS_NEO4J_USERNAME', 'neo4j')
    neo_pass = os.environ.get('OS_NEO4J_PASSWORD', 'test')
    #httpport = int(os.environ.get('OS_NEO4J_GRAPHDB_HTTP_PORT', '27474'))
    #httphost = os.environ.get('OS_NEO4J_GRAPHDB_HTTP_HOST', 'localhost')
    #LOG.warn('using bolt=%s, http=%s as graph database URIs' % (bolt_uri, http_uri))
    #graphargs = dict(user='neo4j', password='bacon4j', http_port=httpport, bolt=True)

    return py2neo.Graph(bolt_uri, http_uri, user=neo_user, password=neo_pass, bolt=True)

def query(query_str, **kwargs):
    dh = db_handle()
    ret = dh.data(query_str, parameters=kwargs)
    if ret and len(ret):
        LOG.info('returned %d rows' % len(ret))
    return ret

def get_node_id(node_obj):
    return remote(node_obj)._id

def run_cypher_script(script_file):
    script_statements = []
    script_buf = []
    with open(script_file, 'r') as sfh:
        for line in sfh.readlines():
            line = line.strip()
            if line.startswith('begin') or line.startswith('//') or line.startswith('commit'):
                continue
            if not len(line):
                continue
            if line.endswith(';'):
                script_buf.append(line)
                script_statements.append('\n'.join(script_buf))
                script_buf = []
            else:
                script_buf.append(line)

    txn = db_handle().begin()
    for stmt in script_statements:
        txn.run(stmt)
    txn.commit()

def construct_query(match_spec, return_spec):
    queryparts = []
    for clause in match_spec:
        kind, pattern, where = clause
        templ = '{kind} {pattern}'
        if where:
            templ += ' WHERE {where}'
        queryparts.append(templ.format(kind=kind.upper(), pattern=pattern, where=where))
    retparts = []
    for entry in return_spec:
        ret, ret_as = entry
        retparts.append('{} AS {}'.format(ret, ret_as))
    query = "\n".join(queryparts)
    query += '\nRETURN {};'.format(', '.join(retparts))
    LOG.info("Query=%s" % query)
    return query

def get_constraints():
    constraints = query("""
    CALL db.constraints() YIELD description AS constraint
    RETURN constraint""")
    return [r['constraint'] for r in constraints]

def info():
    inst_stats = """match (n) where n:Instance or n:RelationInstance with distinct labels(n) as dln, count(n) as lcounts unwind dln as ln return ln, sum(lcounts) as count order by count desc;"""
    class_stats = """match (n) where n:Instance or n:RelationInstance with distinct labels(n) as dln, count(n) as lcounts unwind dln as ln return ln, sum(lcounts) as count order by count desc;"""
    inst_ret = {x['ln']: x['count'] for x in query(inst_stats)}
    cls_ret = {x['ln']: x['count'] for x in query(class_stats)}
    LOG.info(inst_ret)
    LOG.info(cls_ret)

def add_unique_constraint(label, prop_name):
    return query('CREATE CONSTRAINT ON (n:`{label}`) ASSERT n.`{prop}` IS UNIQUE'.format(
        label=label, prop=prop_name))

def build_schema_graph():
    g2 = db_handle()
# scope inheritance query:
# MATCH (cls:Class), p=(cls)-[:isa*0..]->(sc:Class {name: "Any"})
#      WITH cls, extract(n IN nodes(p) | n.scope) AS thing
#            WITH cls, filter(x IN thing WHERE size(x) > 0) AS clean
#            RETURN cls.name AS classname, coalesce(head(clean), []);

    node_classes_query = g2.data("""
    MATCH (cls:Class)
    OPTIONAL MATCH isa=(cls)-[:isa*1..10]->(_supercls:Class {name: "Any"})
    WITH cls, isa, extract(n IN nodes(isa) | n.scope) AS thing
     WITH cls, isa, filter(x IN thing WHERE size(x) > 0) AS clean
      RETURN cls,
       nodes(isa)[1] as supercls,
       [isa_n in nodes(isa) where exists(isa_n.fields) | isa_n.fields] as isa_fields,
       coalesce(head(clean), []) as isa_scope;""")

    relation_classes_query = g2.data("""
    match (rel:RelationClass)
    optional match isa=(rel)-[:isa*1..10]->(superrel:RelationClass)
    optional match (rel)-[:domain]->(domain:Class)
    optional match (rel)-[:range]->(range:Class)
     WITH rel, domain, range, isa, extract(n IN nodes(isa) | n.scope) AS thing
      WITH rel, domain, range, isa, filter(x IN thing WHERE size(x) > 0) AS clean
       RETURN rel, domain, range,
        nodes(isa)[1] as superrel,
        [isa_n in nodes(isa) where exists(isa_n.fields) | isa_n.fields] as isa_fields,
        coalesce(head(clean), []) as isa_scope;
    """)
        # return rel, superrel, domain, range
    LOG.warn('got %d rows for classes' % len(node_classes_query))
    LOG.warn('got %d rows for rels' % len(relation_classes_query))

    outgraph = Graph(use_colours=True)
    print "=======================node_classes_query",node_classes_query
    for row in node_classes_query:
        cls = row['cls']
        cls_id = get_node_id(cls)
        cls_props = copy(dict(cls))
        if 'fields' in cls_props:
            cls_props['fields'] = json.loads(cls_props['fields'])
        if not cls_props['fields']:
            # walk the isa hierarchy and look for field defs
            for parent_fieldspec in row['isa_fields'] or []:
                pfields = json.loads(parent_fieldspec or '{}')
                if pfields:
                    cls_props['fields'] = pfields
                    break
        if not cls_props['scope']:
            cls_props['scope'] = row['isa_scope']

        outgraph.setNode(cls_id, {
            'id': cls_id,
            'name': cls['name'],
            'class': cls['name'],
            'labels': [cls['name']],
            'props': cls_props,
            'class_kind': 'node',
        })

        if row['supercls'] is not None:
            supercls = row['supercls']
            supercls_id = get_node_id(supercls)

            outgraph.setEdge(cls_id, supercls_id, 'ISA', {
                'source': cls_id,
                'target': supercls_id,
                'label': 'ISA'
            })

    for row in relation_classes_query:
        rel =      row['rel']
        superrel = row['superrel']
        domain =   row['domain']
        range_ =   row['range']

        rel_props = copy(dict(rel))
        if 'fields' in rel_props:
            rel_props['fields'] = json.loads(rel_props['fields'])
        else:
            rel_props['fields'] = {}

        if not rel_props['fields']:
            # walk the isa hierarchy and look for field defs
            for parent_fieldspec in row['isa_fields'] or []:
                pfields = json.loads(parent_fieldspec or '{}')
                if pfields:
                    rel_props['fields'] = pfields
                    break
        if not rel_props['scope']:
            rel_props['scope'] = row['isa_scope']
        outgraph.setNode(get_node_id(rel), {
            'id': get_node_id(rel),
            'name': rel['name'],
            'class': rel['name'],
            'labels': [rel['name']],
            'props': rel_props,
            'class_kind': 'relation',
        })

        if superrel is not None:
            outgraph.setEdge(get_node_id(rel), get_node_id(superrel), 'REL_ISA', {
                'source': get_node_id(rel),
                'target': get_node_id(superrel),
                'label': 'REL_ISA'
            })

        if domain is not None:
            outgraph.setEdge(get_node_id(rel), get_node_id(domain), 'DOMAIN', {
                'source': get_node_id(rel),
                'target': get_node_id(domain),
                'label': 'DOMAIN'
            })

        if range_ is not None:
            outgraph.setEdge(get_node_id(rel), get_node_id(range_), 'RANGE', {
                'source': get_node_id(rel),
                'target': get_node_id(range_),
                'label': 'RANGE'
            })
    print "================outgraph===========",outgraph
    return outgraph
def getClassFromNode(nodeId):
    g2 = db_handle()
     
    outgraph = Graph(use_colours=False)
   
    node_query = g2.data("MATCH (n)-[:instance_of]->(cls:Class) WHERE n._oid="+'"{}"'.format(nodeId)+" return cls")
    return node_query[0]
    
def getNodeByClass(nodename,className):
    from itertools import chain
    g2 = db_handle()
    print "========nodename======",nodename
    outgraph = Graph(use_colours=False)
    node_query = g2.data("MATCH(n:"+className+"{name:"+'"{}"'.format(nodename)+"}),(n)-[r*0..2]-(d:Instance) RETURN d as inst")

    rel_query = g2.data("""MATCH (src:Instance)-[:from]->(rel)-[:to]->(dst:Instance),
     (rel)-[:instance_of]->(rel_cls:RelationClass),
     rel_isa=(rel_cls)-[:isa*0..10]->(superrel)
     WHERE NOT (superrel)-[:isa]->()
     RETURN id(src) as src_id, id(dst) as dst_id, rel, rel_cls, rel_isa""")
  
    LOG.warn('got %d rows for nodes' % len(node_query))
    LOG.warn('got %d rows for rels' % len(rel_query))
    print "===========whole query",node_query
    for row in node_query:
        print "===============row=============",row
        inst = row['inst']
        inst_id = get_node_id(inst)
        cls = getClassFromNode(inst['_oid'])
        print "=============type===cls",type(cls)
        print "================cls",cls['cls']['name']
        inst_name = inst.get('name')
        cls_name = cls['cls']['name']
        colour = dict(cls['cls']).get('colour', '#afafaf')

        if inst_name is not None:
            display_label = "{} (:{})".format(inst_name, cls_name)
        else:
            display_label = '(:{})'.format(cls_name)

        instprops = dict(inst)
        instprops.setdefault('colour', colour)

        outgraph.setNode(inst_id, {
            'id': inst_id,
            'class': cls['cls']['name'],
            'labels': list(l for l in inst.labels() if l != 'Instance'),
            'display': display_label,
            'props': dict(inst),
            'colour': colour
        })
    print "node============",outgraph
    for row in rel_query:
        src_id, rel, rel_cls, dst_id = (row[x] for x
                                        in ('src_id', 'rel', 'rel_cls', 'dst_id'))
        rel_id = get_node_id(rel)
        outgraph.setEdge(src_id, dst_id, rel_id, {
            'id': rel_id,
            'source': src_id,
            'target': dst_id,
            'class': rel_cls['name'],
            'display': ":{}".format(rel_cls['name']),
            'props': dict(rel)
        })
    
    return outgraph.as_dict()

def get_instance_graph(name):
    g2 = db_handle()
    print "=======name",name
    outgraph = Graph(use_colours=False)
    node_query = g2.data("MATCH (inst:Instance), (inst)-[:instance_of]->(cls:"+name+"),isa=(cls)-[:isa*0..10]->(supercls) WHERE NOT (supercls)-[:isa]->() RETURN inst, cls, isa")

    rel_query = g2.data("""MATCH (src:Instance)-[:from]->(rel)-[:to]->(dst:Instance),
     (rel)-[:instance_of]->(rel_cls:RelationClass),
     rel_isa=(rel_cls)-[:isa*0..10]->(superrel)
     WHERE NOT (superrel)-[:isa]->()
     RETURN id(src) as src_id, id(dst) as dst_id, rel, rel_cls, rel_isa""")

    LOG.warn('got %d rows for nodes' % len(node_query))
    LOG.warn('got %d rows for rels' % len(rel_query))

    for row in node_query:
        inst = row['inst']
        print "=================row ===========",row
        print "================inst==========",inst
        print inst
        inst_id = get_node_id(inst)
        cls = row['cls']
        print "-===-------cls row",cls
        inst_name = inst.get('name')
        cls_name = cls['name']
        colour = dict(cls).get('colour', '#afafaf')

        if inst_name is not None:
            display_label = "{} (:{})".format(inst_name, cls_name)
        else:
            display_label = '(:{})'.format(cls_name)

        instprops = dict(inst)
        instprops.setdefault('colour', colour)

        outgraph.setNode(inst_id, {
            'id': inst_id,
            'class': cls['name'],
            'labels': list(l for l in inst.labels() if l != 'Instance'),
            'display': display_label,
            'props': dict(inst),
            'colour': colour
        })
    print "node============",outgraph
    for row in rel_query:
        src_id, rel, rel_cls, dst_id = (row[x] for x
                                        in ('src_id', 'rel', 'rel_cls', 'dst_id'))
        rel_id = get_node_id(rel)
        outgraph.setEdge(src_id, dst_id, rel_id, {
            'id': rel_id,
            'source': src_id,
            'target': dst_id,
            'class': rel_cls['name'],
            'display': ":{}".format(rel_cls['name']),
            'props': dict(rel)
        })
    
    return outgraph.as_dict()
def build_instance_graph():
    g2 = db_handle()

    outgraph = Graph(use_colours=False)
    node_query = g2.data("""MATCH (inst:Instance), (inst)-[:instance_of]->(cls:Class),
     isa=(cls)-[:isa*0..10]->(supercls)
     WHERE NOT (supercls)-[:isa]->()
     RETURN inst, cls, isa""")

    rel_query = g2.data("""MATCH (src:Instance)-[:from]->(rel)-[:to]->(dst:Instance),
     (rel)-[:instance_of]->(rel_cls:RelationClass),
     rel_isa=(rel_cls)-[:isa*0..10]->(superrel)
     WHERE NOT (superrel)-[:isa]->()
     RETURN id(src) as src_id, id(dst) as dst_id, rel, rel_cls, rel_isa""")

    LOG.warn('got %d rows for nodes' % len(node_query))
    LOG.warn('got %d rows for rels' % len(rel_query))

    for row in node_query:
        inst = row['inst']
        inst_id = get_node_id(inst)
        cls = row['cls']

        inst_name = inst.get('name')
        cls_name = cls['name']
        colour = dict(cls).get('colour', '#afafaf')

        if inst_name is not None:
            display_label = "{} (:{})".format(inst_name, cls_name)
        else:
            display_label = '(:{})'.format(cls_name)

        instprops = dict(inst)
        instprops.setdefault('colour', colour)

        outgraph.setNode(inst_id, {
            'id': inst_id,
            'class': cls['name'],
            'labels': list(l for l in inst.labels() if l != 'Instance'),
            'display': display_label,
            'props': dict(inst),
            'colour': colour
        })

    for row in rel_query:
        src_id, rel, rel_cls, dst_id = (row[x] for x
                                        in ('src_id', 'rel', 'rel_cls', 'dst_id'))
        rel_id = get_node_id(rel)
        outgraph.setEdge(src_id, dst_id, rel_id, {
            'id': rel_id,
            'source': src_id,
            'target': dst_id,
            'class': rel_cls['name'],
            'display': ":{}".format(rel_cls['name']),
            'props': dict(rel)
        })

    return outgraph

def get_instance_labels():
    inst_label_query = """
    MATCH (n:Instance) WITH DISTINCT labels(n) AS dln, count(n) AS lcounts
    UNWIND dln AS ln
    RETURN ln, sum(lcounts) AS count
    ORDER BY count DESC;"""

    gh = db_handle();
    ret = gh.data(inst_label_query);
    ret_dict = {}
    for row in ret:
        if row['ln'] == 'Instance':
            continue
        ret_dict[row['ln']] = row['count']
    return ret_dict

def get_relation_instance_labels():
    ri_label_query = """
    MATCH (n:RelationInstance) WITH DISTINCT labels(n) AS dln, count(n) AS lcounts
    UNWIND dln AS ln
    RETURN ln, sum(lcounts) AS count
    ORDER BY count DESC;"""

    gh = db_handle();
    ret = gh.data(ri_label_query);
    ret_dict = {}
    for row in ret:
        if row['ln'] == 'RelationInstance':
            continue
        ret_dict[row['ln']] = row['count']
    return ret_dict

def dump_graph_nodes():
    node_query = """
    MATCH (t:Thing)
    RETURN t._oid as t_oid, properties(t) as t_props, labels(t) as t_labels;
    """
    gh = db_handle()
    ret = gh.data(node_query)
    return ret

def load_graph_nodes(nodelist):
    
    gh = db_handle()
    load_node_query = """
    MERGE (n:`Thing` { _oid: $oid })
    SET n = $props
    WITH n
     CALL apoc.create.addLabels(n, $labels) YIELD node AS labelled_node
    RETURN labelled_node;
    """
    # TODO: wrap with transaction
    try:
        #[gh.data(load_node_query,oid=node['t_oid'],props=node['t_props'],labels=[l for l in node['t_labels'] if l != 'Thing']) for node in nodelist ]
        for node in nodelist:
            
            gh.data(load_node_query,
                    oid=node['t_oid'],
                    props=node['t_props'],
                    labels=[l for l in node['t_labels'] if l != 'Thing'])
    except KeyError as ke:
        LOG.error('KeyError: %r in data=%r' % (ke, node))
def deleteChildClass(className):
    gh=db_handle()
    print "in delete ",className
    ret=gh.data("MATCH (cls:"+className+") OPTIONAL MATCH (n)-[:isa]->(cls:"+className+") DETACH DELETE n,cls")

    return ret
        
def dump_graph_edges():
    edge_query = """
    MATCH (t1:Thing)-[r]-(t2:Thing)
    WHERE id(t1) < id(t2)
    RETURN startNode(r)._oid as r_start, endNode(r)._oid as r_end,
     type(r) as r_type, properties(r) as r_props;
    """
    gh = db_handle()
    ret = gh.data(edge_query)
    return ret

def load_graph_edges(edgelist):
    gh = db_handle()
    load_edge_query = """
    MATCH (s:Thing { _oid: $start_oid }), (e:Thing { _oid: $end_oid })
    CALL apoc.create.relationship(s, $rel_type, $rel_props, e) YIELD rel as new_rel
    RETURN new_rel;
    """
    #[gh.data(load_edge_query, start_oid=edge['r_start'], end_oid=edge['r_end'],rel_type=edge['r_type'], rel_props=edge['r_props']) for edge in edgelist]
    for edge in edgelist:
        gh.data(load_edge_query, start_oid=edge['r_start'], end_oid=edge['r_end'],
                rel_type=edge['r_type'], rel_props=edge['r_props'])

def dump_info():
    gh = db_handle()
    label_query = """match (t:Thing) unwind labels(t) as tt return tt, count(tt) as cnt;"""
    rel_query = """
    match (x)-[r]-(y) where id(x) < id(y)
    with count(r) as rtotal, type(r) as rtype, x, y, r
     return rtype, count(rtype) as cnt, rtotal;
    """
    print('labels=%r' % {x['tt']: x['cnt'] for x in gh.data(label_query)})
    print('rels=%r' % {x['rtype']: x['cnt'] for x in gh.data(rel_query)})

def dump_cycle():

    dump_info()

    nodes = dump_graph_nodes()
    edges = dump_graph_edges()

    db_handle().delete_all()
    dump_info()

    load_graph_nodes(nodes)
    load_graph_edges(edges)
    dump_info()

    return {'nodes': nodes, 'edges': edges}


def schema_check():
    gh = db_handle()
    errs = []
    non_things = gh.data('MATCH (x) WHERE NOT(x:Thing) RETURN x')
    if len(non_things):
        errs.append("Non :Thing objects found: %r" % non_things)
    empty_oids = gh.data('MATCH (x) WHERE NOT EXISTS(x._oid) RETURN x')
    if len(empty_oids):
        errs.append("Objects with invalid/empty OID found: %r" % empty_oids)
    clobbered_attrs = gh.data('MATCH (x) WHERE EXISTS(x.clobbered) RETURN x')
    if len(clobbered_attrs):
        errs.append("Objects with clobbered attrs found: %r" % clobbered_attrs)
    dangling_relinst_rels = gh.data('''
    MATCH (x)-[r:to|from]-(y)
    WHERE id(x) < id(y)
    WITH collect(type(r)) AS dir
     UNWIND dir as dd
      RETURN distinct dd, count(dd) as cnt;''')
    num_rels = len(dangling_relinst_rels)
    if num_rels != 2:
        if num_rels != 0:
            raise ValueError('wrong number of items returned')
    else:
        relinst_links = {x['dd']: x['cnt'] for x in dangling_relinst_rels}
        if relinst_links['to'] != relinst_links['from']:
            errs.append('Inconsistent count for :to and :from RelationInstance links: %r' % relinst_links)
    if not len(errs):
        LOG.debug("Schema check ok")
    else:
        LOG.error('schema errors: %r' % (errs,))
        
    return errs
