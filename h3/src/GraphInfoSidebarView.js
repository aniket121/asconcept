import { AlpacaSidebarView } from './AlpacaSidebarView';
import { Action, ActionTypes } from './Action';
import { SchemaUtils } from './GraphUtils';
import { MessageBar } from './MessageBar';

const fieldType2Alpaca = {
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
        "field": "textarea", // FIXME do actual file uploading
    },
};


export class GraphInfoSidebarView extends AlpacaSidebarView {

    constructor(container, graphService, userScope, message, urlService) {
        super(container);

        // this.cyinstance = null;
        // this.cyschema = null;
        this.graphService = graphService;
        this.urlService = urlService;
        this.userScope = userScope;

        this.graphService.onSchemaUpdate( (graphService) => {
            this.graphService = graphService;
        });

        Action.on(ActionTypes.SELECT_TOPIC, (e, data) => {
            this.show( this.renderInstanceNodeInfo(data.node) );
        });

        Action.on(ActionTypes.SELECT_INSTANCES, (e, data) => {
            if(data.nodes.length === 1) {
                this.show( this.renderInstanceNodeInfo(this.graphService.instance.$id(data.nodes[0])) );
            } else {
                this.showPlaceholder();
            }
        });

        Action.on(ActionTypes.SELECT_INSTANCE_EDGE, (e, data) => {
            this.showInstanceEdgeInfo(data.edge);
        });

        Action.on(ActionTypes.SELECT_CLASS, (e, data) => {
            this.showClassNodeInfo(data.class_node);
        });

        Action.on(ActionTypes.SELECT_NONE, (e, data) => {
            this.showPlaceholder();
        });

        this.showPlaceholder();
    }

    onLoadInstanceGraph(cy) {
        this.cyinstance = cy;
    }

    onLoadSchemaGraph(cy) {
        this.cyschema = cy;
    }

    showMessage(msg) {
        this.show( this.renderMessage(msg) );
    }

    showPlaceholder() {
        this.showMessage("Select a node or edge to display info.");
    }

    renderRelationList(node) {
        return node.connectedEdges().map((rel) => {
            let s = rel.source(), d = rel.target(), r = rel.data().cls;
            let sn = s.data().props.name || s.data().cls + '#' + s.id();
            let dn = d.data().props.name || d.data().cls + '#' + d.id();
            let direction = node.same(s) ? 'to ' + dn : 'from ' + sn;

            let schemaUtils = new SchemaUtils(this.graphService);
            let relClass = schemaUtils.getRelationClassByName(r);
            let hasDeletePermission = schemaUtils.getRelationClassScopes(relClass).has(this.userScope);

            if(hasDeletePermission) {
                let deleteButton = $('<a href="#">').text(' Delete').click((ev) => {
                    ev.preventDefault();
                    this.graphService.deleteRelationInstance(rel.id(), (resData) => {

                        // success!
                        Action.trigger(ActionTypes.RELOAD_DATA, { reselect_instance: node.id().toString() });
                    }, () => {
                        new MessageBar(null).message("Error: Failed to delete "+r, {});
                    });
                });
                return $('<li>')
                        .append( $('<span>').text(`${r}: ${direction}`) )
                        .append( deleteButton );
            } else {
                return $('<li>').text(`${r}: ${direction}`);
            }
        }).reduce(
            (ul, ele) => ul.append(ele),
            $('<ul>')
        );
    }

    renderInstanceNodeInfo(_node) {
        let node = this.graphService.instance.$id( _node.id() );
        var nodeData = node.data();
        var className = nodeData.cls;
        var classNode = this.graphService.schema.$(`node[class_kind='node'][name='${className}']`);

        var data = node.data();
        var classData = classNode.data();
        var fields = classData.props.fields;
        var rels = node.connectedEdges();

        let div = $('<div>')
            .append('<p><strong>' + data.cls + '</strong> ' + ((data.props.name) ? data.props.name : '') + '</p>');

        if(this.userScope !== 'viewer') {
            if(rels.length > 0) {
                div.append("This instance has relations:");
                div.append( this.renderRelationList(node) );
            } else {
                div.append("This instance has no relations.");
            }
        }

        if(nodeData.cls === "Playbook") {
            return $('<div>').append(
                $('<div class="btn-group">').append([
                    $('<button type="button" class="btn btn-primary">Open Playbook Viewer</button>').click( (ev) => {
                        Action.trigger(ActionTypes.SELECT_PLAYBOOK, { node: node.id() });
                    }),
                    $('<button type="button" class="btn btn-default">Link Playbook</button>').click( (ev) => {
                        prompt('Copy this Link to Playbook ' + nodeData.name, this.urlService.generatePlaybookUrl(node.id()));
                    } ),
                ]),
                div.css('margin-top', '1em'),
            );
        } else {
            return div;
        }
    }

    showInstanceEdgeInfo(edge) {
        var className = edge.data().cls;
        var classNode = this.graphService.schema.$(`node[class_kind='relation'][name='${className}']`);
        var classProps = classNode.data().props || {};
        var props = edge.data().props || {};
        var fields = classProps.fields || {}; 
        let edgeFieldvals = '';
        if (fields && Object.keys(fields).length > 0) {
            let fnames = Object.keys(fields);
            edgeFieldvals = '(' + fnames.map((fname) => `${fname} = ${props[fname]}`).join(', ') + ')';
        }
        
        var srcInstance = edge.source();
        var dstInstance = edge.target();

        var srcName = srcInstance.data().props.name || srcInstance.data().cls + '#' + srcInstance.id();
        var dstName = dstInstance.data().props.name || dstInstance.data().cls + '#' + dstInstance.id();
        let msg = `<strong>Relations</strong><hr>`;
        msg += `<ul><li>${className}: from ${ srcName } to ${ dstName } ${ edgeFieldvals }</li></ul>`;
        this.showMessage(msg);
    
    }

    showClassNodeInfo(classNode) {
        let class_props = classNode.data().props;
        var fields = class_props.fields;
        var name = class_props.name;
        var scope = class_props.scope;
        var desc = class_props.desc;
        
        let make_cls_link = (clsname) => {
            return `<a href="#" data-class="${clsname}" class="class-link">${clsname}</a>`;
        };
        
        let node_id = classNode.id();
        let cls_rels = this.graphService.getRelationsForClass(node_id, window.app.userScope);
        console.log('node id=', node_id, 'rels=', cls_rels);
        let node_name = classNode.data().name;
        let relinfo = [];
        cls_rels.from.forEach((relcls) => {
            let reldst = relcls.outgoers('.RANGE').targets();
            let dstname = reldst.data().name;
            let relname = relcls.data().name;
            relinfo.push(`${relname}: ${node_name} → ${make_cls_link(dstname)}`);
        });
        cls_rels.to.forEach((relcls) => {
            let relsrc = relcls.outgoers('.DOMAIN').targets();
            let srcname = relsrc.data().name;
            let relname = relcls.data().name;
            relinfo.push(`${relname}: ${node_name} ← ${make_cls_link(srcname)}`);
        });
        let desc_linked = desc.replace(/:(\w+)/g, (m, g1, ...args) => make_cls_link(g1));
        let msg = `<strong>${name}</strong><hr><p>${desc_linked}</p>`;
        if (relinfo.length > 0) {
            msg += `<ul><li>${relinfo.join('</li><li>')}</li></ul>`;
        }
        this.showMessage(msg);
        
    }

    
}
