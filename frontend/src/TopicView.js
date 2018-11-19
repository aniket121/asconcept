import { GraphView } from './GraphView';
import { Action, ActionTypes } from './Action';
import cytoscape from 'cytoscape';
import cydagre from "cytoscape-dagre";

cytoscape.use(cydagre);

export class TopicView extends GraphView {
    constructor(container, graphService) {
    
        super(container);

        this.graphService = graphService;

        this.cy.on('tap', 'node', (e) => {
            var node = e.target;
            Action.triggerElement(this.getContainer(), ActionTypes.SELECT_TOPIC, {
                "node": node,
            });
        });

        this.cy.on('tap', 'edge', (e) => {
            Action.triggerElement(this.getContainer(), ActionTypes.SELECT_INSTANCE_EDGE, { edge: e.target });
        });

        Action.on(ActionTypes.SELECT_CLASS, (e, data) => {
            var cy = this.cy;
            var class_name = data.class_name;

            cy.elements().addClass('faded');
            cy.$("[cls='" + class_name + "']").removeClass('faded');
        });

        // on SELECT_TOPIC, show all instances that have that topic
        Action.on(ActionTypes.SELECT_TOPIC, (e, data) => {
            var cy = this.cy;
            var topic_name = data.node.data().props.name;
            var topic_node = cy.$("node[prop_name='" + topic_name + "']");

            console.log('showing topic', topic_node);
            cy.elements().addClass('faded');
            topic_node.removeClass('faded');
        });

        // on SELECT_INSTANCE, if there are topic nodes, show them
        Action.on(ActionTypes.SELECT_INSTANCES, (e, data) => {
            if(data.fromSearch) {
                let topicNodes = this.cy.collection(data.nodes.filter((id) => this.cy.$id(id).length > 0).map((id) => this.cy.$id(id)));
                this.cy.elements().addClass('faded');
                topicNodes.removeClass('faded');
            } else {
                let instanceNodes = this.graphService.getInstanceCollection(data.nodes).nodes();
            }
        });

    }

    onLayout() {
        // create class tree layout
        // https://github.com/cytoscape/cytoscape.js-dagre#api
        this.layout = this.cy.layout({
            name: 'dagre',
            nodeDimensionsIncludeLabels: true,
            rankDir: 'LR', //BT',
            padding: 10,
            ranker: 'longest-path',
            spacingFactor: 1.0
        });

        // this.layout = this.cy.layout({
        //     name: 'dagre',
        //     rankDir: 'TB',
        //     spacingFactor: 1.25,
        //     nodeSpacing: 30,
        //     fit: true,
        // });

        this.layout.run();
        this.cy.fit();
    }

    onLoadInstanceGraph(allcy) {
        const cy = this.cy;

        cy.elements().remove();

        // only show non-topic instances
        cy.add( allcy.$("node[cls = 'Topic']") );
        cy.add( allcy.$("edge[cls = 'HasSubTopic']") );

        // recreate the layout when adding new elements
        this.onDisplay();
    }
}
