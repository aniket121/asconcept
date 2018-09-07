import cytoscape from "cytoscape";
import { View } from './View';
import { Action, ActionTypes } from "./Action";
import { cytoscapeStylesheet } from "./cystyle";

export class GraphView extends View {
    constructor(container) {
        super(container);

        var options = {
            "container": container,
            "style": cytoscapeStylesheet,
            "minZoom": 0.01,
            "maxZoom": 10,
            // "userZoomingEnabled": false,
        };

        this.cy = cytoscape(options);
        this.cy.panzoom({
            zoomOnly: true,
            // this is kinda horrible but means we dont' have to dig into panzoom to override the button
            fitSelector: (ele) => {
                return this.getSelectedNodes().length > 1 ? ele.selected() : true;
            }
        });

        this.layout_running = false;

        this.cy.on('mouseover', 'node', (e) => {
            var node = e.target;
            Action.triggerElement(this.getContainer(), ActionTypes.UPDATE_HOVERBAR, { node: node  });
        });

        this.cy.on('tap', (e) => {
            if(e.target === this.cy) {
               Action.triggerElement(this.getContainer(), ActionTypes.SELECT_NONE, {});
            }
            this.lastsel = e.target;
        });

        // re-show everything on SELECT_NONE
        Action.on(ActionTypes.SELECT_NONE, (e, data) => {
            this.resetHighlights();
            this.cy.batch( () => {
                this.cy.elements().unselect();
            });
            //debugger;
        });
    }

    getSelectedNodes() {
        
        let nodes = this.cy.nodes().filter(n => n.selected());
        return nodes;

    }

    highlightSelected() {
        let nodes = this.getSelectedNodes();
        this.highlightNodes(nodes);
    }

    highlightNodes(nodes) {
        var neighborhood = nodes.closedNeighborhood();
        neighborhood = neighborhood.union( neighborhood.filter("node[cls='Obligation'], node[cls='Binding']").neighborhood() );

        console.log('highlighting selected + neighborhood:', neighborhood);

        this.cy.batch(() => {
            this.cy.elements().addClass('faded');
            neighborhood.removeClass('faded');
        });
    }

    resetHighlights() {
        this.cy.batch(() => {
            this.cy.elements().removeClass('faded');
        });
    }

    onLayout(forceRefit = false) {
        // to override
    }

    onDisplay() {

        this.cy.resize();
        //this.cy.fit();
        let container = this.getContainer();
        console.log('calling layout from onDisplay for ', $(container).attr('id'));
        if (this.cy.elements().length > 0) {
            this.onLayout(true);
        }
        //this.cy.fit();
    }
    onDispose() {
        super.onDispose();
        if (this.cy) {
            this.cy.destroy();
        }
        if (this.container) {
            this.container.empty();
        }
    }
};
