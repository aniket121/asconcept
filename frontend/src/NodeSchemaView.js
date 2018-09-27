import { GraphView } from './GraphView';
import { Action, ActionTypes } from './Action';
import cytoscape from "cytoscape";
import cydagre from "cytoscape-dagre";

cytoscape.use( cydagre );

export class NodeSchemaView extends GraphView {

    constructor(container, graphService) {
        super(container);
        console.log("graphService==============>",graphService);
        this.graphService = graphService;
        
        this.cy.on('tap', 'node', (e) => {
            console.log("on node tab event",e)
            //var class_name="Agreement"
            var class_name = e.target.data().name;
           
            Action.triggerElement(this.getContainer(), ActionTypes.SELECT_CLASS, { class_name: class_name, class_node: e.target });
        });

        this.cy.on('tap', 'edge', (e) => {
            alert('edge')
            Action.triggerElement(this.getContainer(), ActionTypes.SELECT_CLASS_EDGE, { edge: e.target });
        });

        // show only the given class on SELECT_CLASS and SELECT_INSTANCE
        Action.on(ActionTypes.SELECT_CLASS, (e, data) => {
             
            console.log('select class', e, data);
            this.highlightClass(data.class_name);
            let node = data.class_node, node_id = node.id();
            let cls_rels = this.graphService.getRelationsForClass(node_id);
            console.log('node id=', node_id, 'rels=', cls_rels);
            let node_name = node.data().name;
            cls_rels.from.forEach((relcls) => {
                let reldst = relcls.outgoers('.RANGE').targets();
                console.log(`Class ${node_name} -[${relcls.data().name}]-> ${reldst.data().name}`);
            });
            cls_rels.to.forEach((relcls) => {
                let relsrc = relcls.outgoers('.DOMAIN').targets();
                console.log(`Class ${node_name} <-[${relcls.data().name}]- ${relsrc.data().name}`);
            });

            

            window.app.xx = cls_rels;
        });

        Action.on(ActionTypes.SELECT_INSTANCES, (e, data) => {
            console.log('select instance', e, data);

            if(data.nodes.length === 1) {
                this.highlightClass( this.graphService.getInstanceClassName(data.nodes[0]) );
            } else {
                this.highlightClass();
            }
        });

    }

    highlightClass(class_name) {
        const cy = this.cy;
       
        if(class_name === undefined || class_name === null) {
            cy.elements().removeClass('faded');
            return;
        }

        var node = cy.$("node[name='" + class_name + "']");
        var neighborhood = node.neighborhood().add(node);
        var hierarchy = cy.collection(node).add(node.successors());
        cy.elements().addClass('faded');
       hierarchy.removeClass('faded');
    }

    onLayout() {
        // https://github.com/cytoscape/cytoscape.js-dagre#api
        this.layout = this.cy.layout({
            name: 'dagre',
            nodeDimensionsIncludeLabels: true,
            rankDir: 'RL', //BT',
            padding: 10,
            ranker: 'longest-path',
            spacingFactor: 1.0
        });

        this.layout.run();
        console.log('run dagre');
        this.cy.fit();
    }

    onLoadSchemaGraph(schemacy) {
        const cy = this.cy;
        cy.startBatch();
        cy.elements().remove();
        
        // only show node classes
        console.log("==========schemacy=======================",schemacy.$("node[class_kind = 'node']"));
         cy.add( schemacy.$("node[class_kind = 'node']") );
         cy.add( schemacy.$("edge[label = 'ISA']") );
         cy.endBatch();

        // recreate the layout when adding new elements
        this.onDisplay();
    }

}
