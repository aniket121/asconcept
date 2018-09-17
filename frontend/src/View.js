import cytoscape from "cytoscape";
import { Action, ActionTypes } from "./Action";


export class View {
    constructor(container) {
        if(typeof container === "undefined") {
            console.error("Tried to create view with undefined container");
        }
        this.container = container;
         
        Action.on(ActionTypes.LOADED_SCHEMA_GRAPH, (e, data) => { this.onLoadSchemaGraph(data.cy); });
        Action.on(ActionTypes.LOADED_INSTANCE_GRAPH, (e, data) => { this.onLoadInstanceGraph(data.cy, data.reload_data); });

        this.onInit();

        if (module.hot) {
            module.hot.dispose(data => {
                console.log('being disposed, data=', data);
                this.onDispose();
            });

        }
        this.lastActive = 0;
        $(this.container).on('mouseenter mouseleave', ev => {
            if (ev.type === 'mouseenter') {
                this.lastActive = new Date().getTime();
                // todo: find everything else and mark it inactive
            } else {
                this.lastActive -= 1000;
                if (this.lastActive < 0) { this.lastActive = 0; }
            }
        });
    }

    getContainer() {
        return this.container;
    }

    getLastActive() {
        return this.lastActive;
    }

    show(ele) {
        $( this.getContainer() ).empty().append(ele);

    }

    renderMessage(msg) {
        return $('<div>').html(msg);
    }

    reRender() {
        this.show( this.render() );
    }

    onInit() {
        // to override
    }

    onDisplay() {
        // to override
    }

    onLoadSchemaGraph(cy) {
        // to override
    }

    onLoadInstanceGraph(cy) {
        // to override
    }
    onDispose() {
        // to override
    }

    render() {
        // to override
    }
};

window.View = View;
