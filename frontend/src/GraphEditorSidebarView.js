import _ from 'lodash';
import { View } from './View';
import { Action, ActionTypes } from './Action';
import { API_URL_BASE } from './config';
import { Alpaca } from './Alpaca';
import Snackbar from 'node-snackbar';
import { SchemaUtils } from './GraphUtils';
import * as alertify from 'alertify.js';

function cmpNodesByName(a, b) {
    let A = (a.data().display || a.data().props.name || a.data().cls || '').toUpperCase();
    let B = (b.data().display || a.data().props.name || a.data().cls || '').toUpperCase();

    var result = 0;
    if(A < B) { result = -1; }
    if(A > B) { result = 1; }
    return result;
}

function mkSelectFromNodes(label, nodes) {
    var optionsEles = nodes
        .sort(cmpNodesByName)
        .map( (node) => $('<option>', { value: node.id(), text: "" + (node.data().props.name || "") + " :" + node.data().cls + " (" + node.id() + ")" }) )
        .reduce( (jqcoll, option) => jqcoll.add(option), $() );


    return $('<div>')
        .append( $('<label>').text(label) )
        .append( $('<select>').addClass('form-control').append(optionsEles).change((e) => { console.log('select changed', $(e.currentTarget).val()); } ));
}

function otherDirection(dir) {
    return (dir === "from") ? "to" : "from";
}

class NewRelationForm extends View {

    constructor(container, graphService, alpaca, thisNode, relClassNodes, direction, cyinstance) {
        super(container);
        this.graphService = graphService;
        this.alpaca = alpaca;
        this.cyinstance = graphService.instance;
        this.thisNode = thisNode;
        this.relClassNodes = relClassNodes.toArray();
        this.direction = direction; // either 'from' or 'to'
        this.curRelClassIdx = 0;
        this.reRender();
    }

    reRender() {
        this.show( this.render() );
    }

    render() {
        let relationNames = this.relClassNodes.map(n => n.data().name);
        let optionsEles = this.relClassNodes
            .sort(cmpNodesByName)
            .map( (node) => $('<option>', { value: node.id(), text: node.data().name }) )
            .reduce( (collection, option) => collection.add(option), $());

        let relSelect = $('<select>').addClass('form-control').append(optionsEles)
            .val( this.relClassNodes[this.curRelClassIdx].id() );

        relSelect.change( (e) => {
            this.curRelClassIdx = this.relClassNodes.findIndex( (n) => n.id() == relSelect.val() );
            this.reRender();
        });


        return $('<div>').addClass('form-group')
            .append($('<label>').text("New relation " + this.direction + " this instance"))
            .append( relSelect )
            .append( this.renderSpecificNewRelationForm(this.relClassNodes[this.curRelClassIdx]) );

    }

    renderSpecificNewRelationForm(relClassNode) {
        let optionNodes = this._getRelationOptions(relClassNode, this.direction, this.thisNode.id());

        if(optionNodes.length < 1) {
            return $('<div>').text("There are no instances available to create a "+relClassNode.data().name+" relation.");
        }

        let select = mkSelectFromNodes(otherDirection(this.direction) + " instance", optionNodes);

        let fields = (relClassNode.data().props || {}).fields;
        let hasFields = fields && Object.keys(fields).length > 0;
        let attrsForm = (hasFields) ? this.alpaca.generateAndRenderForm(relClassNode.data().props.fields, {}, false) : null;

        let submitButton = $("<button>").addClass("btn btn-ms-red").text("Create");

        submitButton.click( (e) => {
            let $select = select.find('select');
            console.log("CREATE NEW REL", this.thisNode, relClassNode, $select.val());

            this.graphService.createRelationInstance(
                relClassNode.data().name,
                (this.direction === "from") ? this.thisNode.id() : $select.val(),
                (this.direction === "from") ? $select.val() : this.thisNode.id(),
                (attrsForm === null) ? {} : this.alpaca.getControl(attrsForm).getValue(),
            ).done((data) => {
                Action.trigger(ActionTypes.RELOAD_DATA, { reselect_instance: this.thisNode.id() });
                // TODO: messagebar notify here.
            }).fail(() => {
                console.log('fail, select=', $select.val());
                // TODO: messagebar here
                Snackbar.show({duration: 99999, width: '90%', text: "Sorry, failed to create " + relClassNode.data().name + " relation between " + this.thisNode.id() + " and " + $select.val()});
            });
        });

        return $('<div>')
            .append(select)
            .append(attrsForm)
            .append(submitButton);

    }

    _getRelationOptions(relClassNode, direction, selfNodeId) {
        let rangeClass = relClassNode.connectedEdges(direction === "from" ? "[label='RANGE']" : "[label='DOMAIN']").connectedNodes("[class_kind='node']");
        let rangeSubClasses = rangeClass.predecessors("[class_kind='node']");
        let rangeClassesNames = rangeSubClasses.map( (n) => n.data().props.name ).concat([rangeClass.data().props.name]);

        let canLinkSelf = (relClassNode.data().props.canLinkSelf) ? true : false;
        let optionsNodes = rangeClassesNames
            .reduce( (coll, clsName) => coll.union( this.cyinstance.$("node[cls='" + clsName + "']") ), this.cyinstance.collection() )
            .filter( node => canLinkSelf || !(node.id() === selfNodeId) );

        return optionsNodes;
    }

}

export class GraphEditorSidebarView extends View {

    constructor(container, graphService, uploadService, userScope, messageBar) {
        super(container);

        this.userScope = userScope;
        this.messageBar = messageBar;

        this.graphService = graphService;
        this.schemaUtils = new SchemaUtils(graphService);
        this.uploadService = uploadService;
        this.alpaca = new Alpaca(uploadService);

        this.cyinstance = graphService.instance;
        this.cyschema = graphService.schema;

        this.state = {
            showing: "placeholder",
            instanceNode: null,
            instanceEdge: null,
            classNode: null,
            editing: false,
        };

        this.graphService.onSchemaUpdate( (graphService) => {
            this.graphService = graphService;
            this.schemaUtils = new SchemaUtils(graphService);
        });

        Action.on(ActionTypes.SELECT_TOPIC, (e, data) => {
            this.state.showing = "instanceNodeInfo";
            this.state.instanceNode = data.node;
            this.reRender();
            //this.show( this.renderInstanceNodeInfo(data.node) );
        });

        Action.on(ActionTypes.SELECT_INSTANCES, (e, data) => {
            if(data.nodes.length === 1) {
                this.state.showing = "instanceNodeInfo";
                this.state.instanceNode = this.graphService.instance.$id( data.nodes[0] );
            } else {
                this.state.showing = "placeholder";
            }
			      this.state.editing = false;
            this.reRender();
        });

        Action.on(ActionTypes.SELECT_INSTANCE_EDGE, (e, data) => {
            this.state.showing = "instanceEdgeInfo";
            this.state.instanceEdge = data.edge;
			      this.state.editing = false;
            this.reRender();
            //this.show( this.renderInstanceEdgeInfo(data.edge) );
        });

        Action.on(ActionTypes.SELECT_CLASS, (e, data) => {
            this.state.showing = 'newInstanceForm';
            this.state.classNode = data.class_node;
			      this.state.editing = false;
            this.reRender();
            //this.show( this.renderNewInstanceForm(data.class_node) );
        });

        Action.on(ActionTypes.SELECT_NONE, (e, data) => {
            this.state.showing = 'placeholder';
			      this.state.editing = false;
            this.reRender();
            //this.show( this.renderPlaceholder() );
        });

        this.show( this.render() );
    }

    onLoadInstanceGraph(cy, reload_data) {
        this.cyinstance = cy;

        console.log('initial triggering autoselect instance', reload_data);
        if(reload_data) {
            if(reload_data.reselect_instance) {
                _.defer(() => {
                    console.log('defer: triggering autoselect instance', reload_data.reselect_instance);
                    Action.trigger(ActionTypes.SELECT_INSTANCES, { nodes: [reload_data.reselect_instance] });
                });
            } else if(reload_data.reselect_relation) {
                _.defer(() => {
                    console.log('defer: triggering autoselect relation instance', reload_data.reselect_relation);
                    Action.trigger(ActionTypes.SELECT_INSTANCE_EDGE, { edge: this.graphService.instance.$id(reload_data.reselect_relation) });
                });
            }
        }
    }

    onLoadSchemaGraph(cy) {
        this.cyschema = cy;
    }


    reRender() {
        this.show( this.render() );
    }

    render() {
       
        if(this.state.showing === "placeholder") {
            return this.renderPlaceholder();

        } else if(this.state.showing === "instanceNodeInfo") {
            return this.renderInstanceNodeInfo(this.state.instanceNode);

        } else if(this.state.showing === "instanceEdgeInfo") {
            return this.renderInstanceEdgeInfo(this.state.instanceEdge);

        } else if(this.state.showing === "newInstanceForm") {
            return this.renderNewInstanceForm(this.state.classNode);

        } else {
            console.error('Unknown screen ' + this.state.showing);
        }
    }

    renderMessage(msg) {
        return $('<div>').html(msg);
    }

    renderPlaceholder() {
        if (this.userScope === 'viewer') {
            return this.renderMessage(''); // blank message here for viewers who can't edit anyway.
        } else {
            return this.renderMessage("Select an instance node or relation to edit, or select a class to create a new instance.");
        }
    }

    renderInstanceNodeInfo(node) {
        return $('<div>')
            .append( this.renderInstanceNodePropsInfo(node) )
            .append( this.renderInstanceRelationForms(node) );
    }

    renderInstanceNodePropsInfo(node) {
        var nodeObject=node;
        console.log("===============node============",node)
        var nodeData = node.data();
        var className = nodeData.cls;
        var classNode = this.cyschema.$("node[class_kind='node'][name='" + className + "']");

        var data = node.data();
        var classData = classNode.data();
        var fields = classData.props.fields;
        window.documetAttachment=data.props.attachment

        console.log('rendering display form, fields=', fields, 'classinfo=', classData, 'data=>', data);
        var editorViewThis = this;


        let self = this;
        var buttons = (this.userScope === 'viewer') ? {} : {
            "delete": {
                "value": "Delete this " + classData.props.name,
                "styles": 'btn btn-ms-red',
                "click": function(ev) {
                      var val = this.getValue();
                    alertify.confirm("Are you sure want to delete?",
                   function(){
                       alertify.success('Ok');
                        
                    let delReq = self.graphService.deleteNodeInstance(node.id());
                    delReq.done(function() {
                        console.log('form submit succeeded?');
                        Action.trigger(ActionTypes.RELOAD_DATA, {});
                        self.messageBar.info("Deleted instance #"+node.id());
                    }).fail(function() {
                        console.warn('form submit fail?');
                        self.messageBar.error("Error: Failed to delete node #"+node.id());
                    });
                   });
                  
                 
                }
            },
            "editOrCancel": {
                "value": this.state.editing ? "Cancel" : "Edit",
                "styles": 'btn btn-ms-red',
                "click": (ev) => {
                    this.state.editing = !this.state.editing;
                    //var attachmentValue=data.props.attachment
                    if(this.state.editing){
                      data.props.attachment=''
                    }
                    else{
                      //alert('cancel')
                      window.location.reload()

                      
                    }
                    this.reRender();
                }
            }
        };

        if(this.state.editing) {
            buttons['save'] = {
                "value": "Save",
                "styles": 'btn btn-ms-red',
                "click": function(ev) {
                    let viewState = editorViewThis.state;
                    let nodeId = viewState.instanceNode.id();

                    let newData = this.getValue();
                    console.log('SAVE! new=', newData);
                    
                    self.graphService.updateNodeInstance(nodeId, newData).done(function(...args) {
                        console.log('edit success, ret=', args);
                        editorViewThis.state.editing = false;
                        editorViewThis.reRender();
                        Action.trigger(ActionTypes.RELOAD_DATA, {
                            reselect_instance: nodeId
                        });
                    }).fail(function(...args) {
                        console.error('edit failed, ret=', args);
                    });
                }
            };
        }

        return this.alpaca.generateAndRenderForm(fields, data.props, !this.state.editing, buttons,
                                                 this.state.editing ? 'bootstrap-edit-horizontal' : 'bootstrap-display-horizontal', this.state.editing);
    }

    renderInstanceRelationForms(node) {
        //var rels = node.connectedEdges();
        //var relsClassNodes = rels.map( (rel) => this.cyschema.nodes("[cls='" + rel.data().cls + "']")[0] );
        var className = node.data().cls;
        var classNode = this.cyschema.$("node[class_kind='node'][name='" + className + "']");
        let cls_isas = classNode.successors('edge.ISA').connectedNodes();


        let avail_rels = {
            from: cls_isas.connectedEdges('edge.DOMAIN').sources().filter( (n) => this.schemaUtils.getRelationClassScopes(n).has(this.userScope) ),
            to: cls_isas.connectedEdges('edge.RANGE').sources().filter( (n) => this.schemaUtils.getRelationClassScopes(n).has(this.userScope) )
        };

        var result = $('<div>');

        if(avail_rels.from.length > 0) {
            var fromRelationFormDiv = $('<div>');
            this.fromRelationForm = new NewRelationForm(fromRelationFormDiv, this.graphService, this.alpaca, node, avail_rels.from, 'from', this.cyinstance);
            result.append( fromRelationFormDiv );
        }

        if(avail_rels.to.length > 0) {
            var toRelationFormDiv = $('<div>');
            result.append( toRelationFormDiv );
            this.toRelationForm = new NewRelationForm(toRelationFormDiv, this.graphService, this.alpaca, node, avail_rels.to, 'to', this.cyinstance);
        }

        if(avail_rels.to.length < 1 && avail_rels.from.length < 1) {
            result.text(''); // "No relations are available to be created.");
        }

        return result;
    }


    renderInstanceEdgeInfo(edge) {
        var className = edge.data().cls;
        var classNode = this.graphService.schema.$("node[class_kind='relation'][name='" + className + "']");
        var classProps = classNode.data().props || {};
        var props = edge.data().props || {};
        var fields = classProps.fields || {};
        var editorViewThis = this;

        var buttons = (this.userScope === 'viewer') ? {} : {
            "delete": {
                "value": "Delete this " + classNode.data().name + " Relation",
                "styles": 'btn btn-ms-red',
                "click": (ev) => {
                    this.graphService.deleteRelationInstance(edge.id().toString(),
                                                             (resultData) => {
                                                                 // succees
                                                                 editorViewThis.messageBar.info("Deleted " + classNode.data().name + " relation.");
                                                                 Action.trigger(ActionTypes.RELOAD_DATA, {});
                                                             },
                                                             () => {
                                                                 editorViewThis.messageBar.error('Failed to delete ' + classNode.data().name + ' relation');
                                                                 // fail :(
                                                             }
                                                            );
                }
            },
        };

		    if(!$.isEmptyObject(fields)) {
            buttons["editOrCancel"] = {
                "value": this.state.editing ? "Cancel" : "Edit",
                "click": (ev) => {
                    this.state.editing = !this.state.editing;
                    this.reRender();
                },
                "styles": 'btn btn-ms-red'
            };
		    }

        if(this.state.editing) {
            buttons['save'] = {
                "value": "Save",
                "styles": 'btn btn-ms-red',
                "click": function(ev) {
                    let viewState = editorViewThis.state;
                    let edgeId = viewState.instanceEdge.id();
                    let newData = this.getValue();

                    console.log('SAVE! Relation', this.getValue());
                    editorViewThis.graphService.updateRelationInstance(edgeId, newData).done(function(...args) {
                        console.log('edit success, ret=', args);
                        editorViewThis.state.editing = false;
                        editorViewThis.reRender();
                        Action.trigger(ActionTypes.RELOAD_DATA, {
                            reselect_relation: edgeId
                        });
                    }).fail(function(...args) {
                        console.error('edit failed, ret=', args);
                    });
                }
            };
        }

        // don't allow people to delete relations they don't have the scope for
        if( ! this.graphService.getRelationClassScopes(classNode).has(this.userScope) ) {
            buttons = {};
        }

        return this.alpaca.generateAndRenderForm(fields, props, !this.state.editing, buttons,
                                                 this.state.editing ? 'bootstrap-edit-horizontal' : 'bootstrap-display-horizontal', this.state.editing);
        //return this.alpaca.generateAndRenderForm(fields, props, true, buttons)
    }

    renderNewInstanceForm(classNode) {
        var fields = classNode.data().props.fields;
        var name = classNode.data().props.name;
        var scope = classNode.data().props.scope;
        
        if(scope.length == 0) {
            return this.renderMessage("Creating instances of " + name + " not possible, please choose a subclass.");
        }
        console.log('creating form at formscope=%O, userscope=%O', scope, this.userScope);
        let canCreate = (formScope, userScope) => {
            return (formScope.length && formScope.includes(userScope));
        };

        let readOnly = !canCreate(scope, this.userScope);

        if (readOnly) {
            return $('<div>dummy</div');
        }

        let self = this;
        var buttons = {
            "submit": {
                "value": "Create " + name,
                "styles": 'btn btn-ms-red',
                "click": function(ev) {
                    console.log('GESV.renderNewInstanceForm Create.click this=', this, ', ev=', ev);

                    let attachmentControl = this.topControl.top().getControlByPath("attachment");

                    if(attachmentControl && !attachmentControl.os_getUploadDone()) {
                        let result = confirm("No attachment has been uploaded, or has not finished uploading. Are you sure you want to create this node without an attachment?");
                        if(!result) { return; }
                    }

                    var val = this.getValue();
                    console.log("----------val---------",val)
                    console.log('submit clicked, val=', JSON.stringify(val));

                    let ajaxReq = self.graphService.createNodeInstance(name, val);
                    ajaxReq.done(function(data) {
                        console.log('form submit succeeded? DATA:', data);
                        alert(data.class)
                        if(data.class=="Playbook"){
                         console.log("window object====>",window)
                         // var openUrl=localStorage.getItem("url");
                         // alert(openUrl)
                          //window.open(openUrl, '_parent'); 
                          //location.reload(true)
                        }
                        self.messageBar.info("Created " + name + " instance.");
                        Action.trigger(ActionTypes.RELOAD_DATA, { reselect_instance: data.id });
                    }).fail(function(xhr, code, reason) {
                        let error_message = reason;
                        if (xhr && xhr.responseJSON && xhr.responseJSON.message) {
                            error_message = Object.entries(xhr.responseJSON.message).map(([k, v]) => `${v}: ${k}`).join('<br/>');
                        }
                        console.warn('form submit fail?',reason);
                        self.messageBar.error("Error: Failed to create "+name + ":<br>\n" + error_message, {});
                    }).always(function(...args){
                        console.log('form submit?!?', this, 'args=', args);
                    });
                }
            }
        };

        console.log('setting form RO=', readOnly);
        return this.alpaca.generateAndRenderForm(fields, {}, readOnly, buttons);
    }
}
