import $ from 'jquery';

export const ActionTypes = {
    RELOAD_DATA: 'RELOAD_DATA', // data = { < reselect_instance: <id> > }
    LOADED_SCHEMA_GRAPH: 'LOADED_SCHEMA_GRAPH',     // data = { cy: <cytoscape> }
    LOADED_INSTANCE_GRAPH: 'LOADED_INSTANCE_GRAPH', // data = { cy: <cytoscape> }

    UPDATE_HOVERBAR: 'UPDATE_HOVERBAR', // data = { node: <cy node> } 

    UPDATE_INSTANCE_VISIBILITY: 'UPDATE_INSTANCE_VISIBILITY', // data = { filterRules: <filter rules> }

    SELECT_INSTANCES: 'SELECT_INSTANCES', // data = { nodes: [ node ids ] }
    SELECT_INSTANCE_EDGE: 'SELECT_INSTANCE_EDGE', // data = { edge: <cy edge> }
    SELECT_CLASS: 'SELECT_CLASS',       // data = { class_name: <str class name>, class_node: <cy class node> }
    SELECT_CLASS_EDGE: 'SELECT_CLASS_EDGE', // data = { edge: <cy edge> }
    SELECT_NONE: 'SELECT_NONE',         // data = {}
    SELECT_TOPIC: 'SELECT_TOPIC',       // data = { node: <cy topic instance node> }

    SELECT_PLAYBOOK: 'SELECT_PLAYBOOK', // data = { node: <node id> }
    PLAYBOOK_CLOSE: 'PLAYBOOK_CLOSE',   // data = {}

    SHOW_SCHEMA: 'SHOW_SCHEMA',         // data = {}
    SHOW_TOPICS: 'SHOW_TOPICS',         // data = {}
    SHOW_PLAYBOOK: 'SHOW_PLAYBOOK',     // data = {}
};

export class Action {
    static on(actionType, cb) {
        this.onElement(document, actionType, cb);
    }

    static onElement(element, actionType, cb) {
        if(typeof actionType === 'undefined') {
            console.error('Attempting to listen to action of type undefined');
        }
        $(element).on(actionType, {}, cb);
    }

    static trigger(actionType, data) {
       this.triggerElement(document, actionType, data); 
    }

    static triggerElement(element, actionType, data) {
        if(typeof actionType === 'undefined') {
            console.error('Attempting to trigger to action of type undefined');
        }
        console.log('Action', actionType, data);
        $(element).trigger(actionType, [data]);
    }
}
