import $ from "jquery";
import _ from 'lodash';
import { API_URL_BASE } from './config';
import cytoscape from "cytoscape";
import { SchemaUtils } from './GraphUtils';
import { KeywordIndex } from './KeywordIndex';

function schemaGraph(data) {
   
    console.log("================>schemadata=========",data)
    var nodes = data.nodes.map(function(n) {
        return {
            group: "nodes",
            classes: n.labels.join(" "),
            data: {
                id: n.id.toString(),
                name: n.name,
                display: n.name,
                colour: n.colour,
                labels: n.labels,
                class_kind: n.class_kind,
                src_obj: n,
                props: n.props,
                is_schema: true,
            }
        }
    });
    console.log("noede-========",nodes);

    var edges = data.edges.map(function(e) { return {
        group: "edges",
        classes: e.label,
        data: {
            source: e.source.toString(),
            target: e.target.toString(),
            label: e.label,
            display: e.label,
            src_obj: e,
            props: e.props,
            is_schema: true,
        }
    }});
    console.log("edge=======-========",edges);
     
    
    return cytoscape({
        headless: true,
        elements: {
            nodes: nodes,
            edges: edges
        }
    });
}

function instanceNodeRemote2Local(node) {
        return {
            group: 'nodes',
            classes: node.labels.map(x => `node-${x}`).join(' '),
            data: {
                id: node.id.toString(),
                labels: node.labels,
                display: node.display,
                cls: node.class,
                colour: node.colour,
                name: node.props.name,
                prop_name: node.props.name,
                props: node.props,
                oid: node.props._oid,
                is_instance: true
            }
        }
}

function instanceEdgeRemote2Local(edge) {
        return {
            group: 'edges',
            data: {
                id: edge.id.toString(),
                cls: edge.class,
                display: edge.display + ((edge.props.value) ? ("=" + edge.props.value.slice(0, 20)) : ""),
                label: edge.display,
                source: edge.source.toString(),
                target: edge.target.toString(),
                props: edge.props,
                is_instance: true,
            }
        }
}

function instanceGraph(data) {
    var instance_nodes = data.nodes.map(instanceNodeRemote2Local);
    var instance_edges = data.edges.map(instanceEdgeRemote2Local);

    return cytoscape({
        headless: true,
        elements: {
            nodes: instance_nodes,
            edges: instance_edges
        }
    });
}

export class GraphService {
    constructor(url_base) {
        this.url_base = "http://0.0.0.0:8001";
        this.onSchemaUpdateCallbacks = [];
        this.onInstanceUpdateCallbacks = [];
        this._schemagraph = cytoscape({ headless: true });
        this._instancegraph = cytoscape({ headless: true });
        this.utils = new SchemaUtils(this);
        this.keywordIndex = new KeywordIndex();
    }

    _updateKeywordIndex() {
        this.keywordIndex = KeywordIndex.newFromGraph(this.instance);
    }

    getKeywordIndex() {
        return this.keywordIndex;
    }

    emptyGraph() {
        return cytoscape({ headless: true });
    }

    onSchemaUpdate(cb) {
        this.onSchemaUpdateCallbacks.push(cb);
    }

    onInstanceUpdate(cb) {

        this.onInstanceUpdateCallbacks.push(cb);
    }

    get schema() {
        return this._schemagraph;
    }

    get instance() {
        return this._instancegraph;
    }

    getInstanceCollection(nodeIds, cy) {
        if(cy === undefined || cy === null) {
            cy = this.instance;
        }
        return cy.collection( nodeIds.map(id => cy.$id(id)).filter(n => n.length) );
    }

    // API methods
    loadSchemaGraph(cb) {
        $.getJSON(this.url_base  + "/schema/graph", (schemadata) => {
            if (this._schemagraph) {
                this._schemagraph.destroy();
            }
            var dumpClass=[]
            this._schemagraph = schemaGraph(schemadata);
            
            if(schemadata){
              for(var i=0;i<schemadata.node_types.length;i++){
               
                if(schemadata.node_types[i]!="Topic" && schemadata.node_types[i]!="PlaybookRule" ){
                 console.log("-------",schemadata.nodes[i])
                 dumpClass.push(schemadata.node_types[i])
                 
                }
              }
              

            }
            localStorage.setItem("schemaNodes",JSON.stringify(dumpClass))

            console.log("=================>",localStorage.getItem("schemaNodes"))
            cb( this._schemagraph );
            var nodes=[]
            var edges=[]
            nodes.push(schemadata.nodes)
            edges.push(schemadata.edges)
            console.log("====================sss nodes=============",nodes.concat(edges))
            console.log("====================edges=============",{"nodes":nodes[0]},{"edges":nodes[1]})
            this.onSchemaUpdateCallbacks.forEach( (cb) => cb(this) );
        });
    }

    loadInstanceGraph(cb) {
        
        $.getJSON(this.url_base + "/graph", (data) => {
            if (this._instancegraph) {
                this._instancegraph.destroy();
            }
            
            this._instancegraph = instanceGraph(data);

            console.log("this._instancegraph ",data )
            if(data){
              
                
                 $("body").css("opacity","2.2");
                 $(".isloading").css("display","none");
            }
            

            this._updateKeywordIndex();

            cb( this._instancegraph );
             
            this.onInstanceUpdateCallbacks.forEach( (cb) => cb(this) );
        });

    }

    createNodeInstance(className, props) {

       
       
        let data = Object.assign({}, props);
         if(data.RegisteredOffice || data.Legalform){
         data.RegisteredOffice=props.RegisteredOffice[0];
         data.Legalform=props.Legalform[0];
        }
        data["class_name"] = className;
       
        var ajaxReq = $.ajax(this.url_base + "/instances/", {
            "data": JSON.stringify(data),
            "type": "POST",
            "contentType": "application/json",
        });
        return ajaxReq;

    }

    updateNodeInstance(nodeId, newProps) {
        let origData = this.instance.$id(nodeId).data().props;
        let diffs = {};
        for (let k of Object.keys(origData)) {
            if (newProps[k] !== undefined && newProps[k] !== origData[k]) {
                diffs[k] = newProps[k];
            }
        }
        if(diffs.Legalform || diffs.RegisteredOffice){
          //diffs.Legalform=diffs.Legalform[0]
          //diffs.RegisteredOffice=diffs.RegisteredOffice[0]
        }
        let updateUrl = this.url_base + "/instances/" + nodeId + '/';
        return $.ajax(updateUrl, {
            type: 'POST',
            data: JSON.stringify(diffs),
            contentType: 'application/json',
        });
    }

    deleteNodeInstance(id, succ, fail, always) {
        return $.ajax(this.url_base + "/instances/" + id.toString() + '/', {
            "data": {},
            "type": "DELETE",
            "contentType": "application/json",
        }).done(succ).fail(fail).always(always);
    }

    createRelationInstance(className, fromId, toId, props) {
        return $.post({ 
            url: this.url_base + "/relations/", 
            data: JSON.stringify({
                "relation_name": className,
                "src_id": fromId,
                "dst_id": toId,
                "rel_attrs": (props) ? props : {},
            }),
            contentType: 'application/json',
            type: 'POST'
        });
    }

    updateRelationInstance(elementId, newProps) {
        let origData = this.instance.$id(elementId).data().props;
        let diffs = {};
        for (let k of Object.keys(origData)) {
            if (newProps[k] !== undefined && newProps[k] !== origData[k]) {
                diffs[k] = newProps[k];
            }
        }
        let updateUrl = this.url_base + "/relations/" + elementId + '/';
        return $.ajax(updateUrl, {
            type: 'POST',
            data: JSON.stringify(diffs),
            contentType: 'application/json',
        });
    }

    deleteRelationInstance(id, succ, fail, always) {
        var ajaxReq = $.ajax(this.url_base + "/relations/" + id.toString() + '/', {
            "type": "DELETE",
            "data": {},
            "contentType": "application/json",
        }).done(succ).fail(fail).always(always);
    }

    // Utilities
    getNodeByOid(oid) {
        return this.instance.filter( n => n.data().oid === oid);
    }

    getRelationsForClass(class_id, scope) {
        let cls = this._schemagraph.$id(class_id);
        let cls_isas = cls.successors('edge.ISA').connectedNodes();
        
        let avail_rels = {
            from: cls_isas.connectedEdges('edge.DOMAIN').sources()
                .filter( (n) => this.utils.getRelationClassScopes(n).has(scope) ),
            to: cls_isas.connectedEdges('edge.RANGE').sources()
                .filter( (n) => this.utils.getRelationClassScopes(n).has(scope) )
        };
        return avail_rels;
    }   

    getTopicByName(name) {
        return this.instance.$("[cls='Topic'][name='"+name+"']");
    }

    getTopicImmediateChildren(_topicNode) {
        if(!_topicNode || _topicNode.length < 1) {
            console.error('GraphService.getTopicImmediateChildren: no topic node given');
            return null;
        }

        let topicNode = this.instance.$id( _topicNode.id() );
        let subTopics = topicNode.outgoers('edge[cls="HasSubTopic"]').targets();
        return subTopics;
    }

    getInstanceClassName(id) {
        return this.instance.$id(id).data().cls;
    }

    getInstanceClassByName(name) {
        return this.schema.$("node[class_kind='node'][name='"+name+"']");
    }

    getInstanceClassImmediateChildren(_relClassNode) {
        if(!_relClassNode || _relClassNode.length < 1) {
            console.error('GraphService.getInstanceClassImmediateChildren: no class node given');
            return null;
        }

        let relClass = this.schema.$id( _relClassNode.id() );
        let subClasses = this.schema.collection([relClass]).incomers("edge[label='ISA']").sources();
        return subClasses;
    }

    getRelationClassImmediateParents(_relClassNode) {
        let relClass = this.schema.$id( _relClassNode.id() );
        return this.schema.collection([relClass]).outgoers("edge[label='REL_ISA']").targets();
    }
    
    getRelationClassImmediateParent(_relClassNode) {
        let parentClasses = this.getRelationClassImmediateParents(_relClassNode);

        if(parentClasses.length > 1) {
            console.warn('RelationClass ' + relClass.data().props.name + ' has more than one parent RelationClass!');
        }

        if(parentClasses.length > 0) {
            return parentClasses[0];
        } else {
            return null;
        }
    }

    getRelationClassImmediateChildren(_relClassNode) {
        let relClass = this.schema.$id( _relClassNode.id() );
        console.log('getRelationClassImmediateChildren(_relClassNode=',_relClassNode,') relClass=',relClass);
        let subClasses = this.schema.collection([relClass]).incomers("edge[label='REL_ISA']").sources();
        return subClasses;
    }

    getRelationClassScopes(_relClassNode) {
        var relClass = this.schema.$id( _relClassNode.id() );
        var relScopes = new Set( relClass.data().props.scope );
        var parentClasses = this.getRelationClassImmediateParents(relClass);

        if(parentClasses.length > 1) {
            let parentScopes = parentClasses.reduce( (scopes, n) => setUnion(scopes, this.getRelationClassScopes(n)), new Set() );
            return setUnion(relScopes, parentScopes);
        } else {
            return relScopes;
        }
    }

    getRelationClassByName(name) {
        return this.schema.$("node[class_kind='relation'][name='"+name+"']");
    }

    getRelationClassFields(relClassName) {
        var relClassNode = this.getRelationClassByName(relClassName);

        do {
            if(!relClassNode) {
                return {};
            }
            fields = relClassNode.data().props.fields;

            relClassNode = this.getRelationClassImmediateParent(relClassNode);
        } while(!fields || $.isEmptyObject(fields));

        return fields;
    }
};

export class MockGraphService extends GraphService {
    constructor(instanceDataUrl, schemaDataUrl) {
        super("");
        this._instanceDataUrl = instanceDataUrl;
        this._schemaDataUrl = schemaDataUrl;
        this._loadedInstance = false;
        this._loadedSchema = false;
        this._mockRemoteInstance = cytoscape({ headless: true });
        this._curMockId = 1;
    }

    _newMockId() {
        let id = "mock" + this._curMockId;
        this._curMockId = this._curMockId + 1;
        return id;
    }

    // API methods
    _actuallyLoadSchemaGraph(cb) {
        $.getJSON(this._schemaDataUrl, (schemadata) => {
            if (this._schemagraph) {
                this._schemagraph.destroy();
            }
            this._schemagraph = schemaGraph(schemadata);
            this._loadedSchema = true;
            
            cb();;
        });
    }

    loadSchemaGraph(cb) {
        let dostuff = () => {
            cb( this._schemagraph );
            this.onSchemaUpdateCallbacks.forEach( (cb) => cb(this) );
        };

        if(!this._loadedSchema) {
            this._actuallyLoadSchemaGraph(dostuff);
        } else {
            setTimeout(dostuff, Math.floor((Math.random() * 500) + 100));
        }
    }

    _actuallyLoadInstanceGraph(cb) {
        $.getJSON(this._instanceDataUrl, (data) => {
            if (this._mockRemoteInstance) {
                    this._mockRemoteInstance.destroy();
            }
            this._mockRemoteInstance = instanceGraph(data);
            this._loadedInstance = true;

            cb();
        });
    }
    
    loadInstanceGraph(cb) {

        let dostuff = () => {
            this._instancegraph = cytoscape({ headless: true });
            this._instancegraph.batch(() => {
                this._instancegraph.add( this._mockRemoteInstance.elements().clone() );
            });

            this._updateKeywordIndex();

            cb( this._instancegraph );
            this.onInstanceUpdateCallbacks.forEach( (cb) => cb(this) );
        };

        if(!this._loadedInstance) {
            this._actuallyLoadInstanceGraph(dostuff);
        } else {
            setTimeout(dostuff, Math.floor((Math.random() * 500) + 100));
        }

    }

    createNodeInstance(className, props) {
        let data = {
            "id": this._newMockId(),
            "class": className,
            "display": props.name + " (:" + className + ")",
            "props": props,
            "labels": [className],
            "colour": this.getInstanceClassByName(className).data().props.colour,
        };

        this._mockRemoteInstance.add(instanceNodeRemote2Local(data));

        console.log('MockGraphService.createNodeInstance(', className, ', ', props, ') -> Node #', data.id);

        // fake jQuery ajax object
        return {
            "done": function(cb) { setTimeout(() => { cb({"_id": data.id}); }, 50); return this; },
            "fail": function(cb) { return this; },
            "always": function(cb) { cb(); return this; },
        };
    }

    updateNodeInstance(nodeId, newProps) {
        let node = this._mockRemoteInstance.$id(nodeId);
        node.data('props', newProps);
        node.data('props_name', newProps.name);
        node.data('display', newProps.name + ' (:' + node.data().cls + ')');
        
        // fake jQuery ajax object
        return {
            "done": function(cb) { setTimeout(() => { cb({}); }, 50); return this; },
            "fail": function(cb) { return this; },
            "always": function(cb) { cb(); return this; },
        };

    }

    deleteNodeInstance(id) {
        this._mockRemoteInstance.remove(
            this._mockRemoteInstance.$id(id)
        );

        // fake jQuery ajax object
        return {
            "done": function(cb) { setTimeout(() => { cb({}); }, 50); return this; },
            "fail": function(cb) { return this; },
            "always": function(cb) { cb(); return this; },
        };
    }

    createRelationInstance(className, fromId, toId, props) {
        let data = {
            "id": this._newMockId(),
            "class": className,
            "display": ":" + className,
            "source": fromId,
            "target": toId,
            "props": props,
        };

        this._mockRemoteInstance.add(
            instanceEdgeRemote2Local(data)
        );

        // fake jQuery ajax object
        return {
            "done": function(cb) { setTimeout(() => { cb({"_id": data.id}); }, 50); return this; },
            "fail": function(cb) { return this; },
            "always": function(cb) { cb(); return this; },
        };
    }

    updateRelationInstance(id, newProps) {
        let node = this._mockRemoteInstance.$id(nodeId);
        node.data('props', newProps);
        node.data('props_name', newProps.name);
        node.data('display', ':' + node.data().cls + (newProps.value) ? ('='+newProps.value) : '');
        
        // fake jQuery ajax object
        return {
            "done": function(cb) { setTimeout(() => { cb({}); }, 50); return this; },
            "fail": function(cb) { return this; },
            "always": function(cb) { cb(); return this; },
        };
    }

    deleteRelationInstance(id, succ, fail, always) {
        this._mockRemoteInstance.remove(
            this._mockRemoteInstance.$id(id)
        );

        // fake jQuery ajax object
        return {
            "done": function(cb) { setTimeout(() => { cb({}); }, 50); return this; },
            "fail": function(cb) { return this; },
            "always": function(cb) { cb(); return this; },
        }.done(succ).fail(fail).always(always);
    }

}
