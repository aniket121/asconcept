import { CytoQuery } from './CytoFilter';
import { Action, ActionTypes } from './Action';

// Example:
// filterRules = {
//     includeClasses: ["Document", "Role", ...],
//     includeTopics: ["Confidentiality", "Data Protection", ...],
//     includeKeywords: ["mandatory", "disclosures", "duration", ...],
//     includeManualAndExpand: ["1234", "7342", ...]
// }


export const DEFAULT_RULES = {
    includeClasses: new Set( JSON.parse(localStorage.getItem("schemaNodes"))),

    includeTopics: new Set([

    ]),

    includeKeywords: new Set(),

    includeManualAndExpand: new Set(),

    includeManual: new Set(),
};
function generateLink(oid){
    return "http://localhost:9000/#playbook_openOid="+oid+"&filter_includeManual="+oid+"&select="+oid+"&v=1";

}
export const DEFAULT_VIEWER_RULES = {
    includeClasses: new Set([]),
    includeTopics: new Set([]),
    includeKeywords: new Set([]),
    includeManualAndExpand: new Set([]),
    includeManual: new Set([])
};

export  class VisibilityService {
    constructor(graphService, defaultRules) {
        this.callbacks = [];
        this.clearCallbacks = [];
        this.rules = defaultRules || DEFAULT_RULES;
        this.graphService = graphService;
        this.cytoQuery = new CytoQuery(graphService.instance);

        this.graphService.onInstanceUpdate(() => { this.onLoadInstanceGraph(); });
    }

    onLoadInstanceGraph() {
        this.setRules(this.rules, { 'reload': true });
    }

    registerCallback(fn) {
        this.callbacks.push(fn);
    }

    registerClearCallback(fn) {
        this.clearCallbacks.push(fn);
    }

    getRules() {
        return this.rules;
    }

    getCytoQuery() {
        return this.cytoQuery;
    }

    setRules(newRules, extraOptions) {
        if(!extraOptions) { extraOptions = {}; }

        Object.keys(newRules).forEach(k => {
            newRules[k] = new Set(newRules[k]);
        });
        let oldRules = this.rules;
        this.rules = newRules;
        console.log('VisibilityService.setRules oldRules=', oldRules, 'newRules=', newRules, 'extraOptions=', extraOptions);

        if(extraOptions.preloadOnly) { return; }

        this.cytoQuery = new CytoQuery(this.graphService).applyFilterRules(newRules, oldRules);

        this.callbacks.forEach( (cb) => {
            cb(newRules, extraOptions);
        });
    }

    setIncludeClasses(classes) {
        let rules = Object.assign({}, this.rules);
        rules.includeClasses = new Set(classes);
        this.setRules(rules);
    }

    setIncludeTopics(topics) {
         console.log("topics==>",topics)
         alert('click')
        let rules = Object.assign({}, this.rules);
        rules.includeTopics = new Set(topics);
        this.setRules(rules);
        var topic_node = this.graphService.instance.$("node[cls='Topic'][prop_name='" + topics + "']");
        var hastopic_edges = topic_node.connectedEdges("edge[cls='HasTopic']");
        var nodes_in_topic = hastopic_edges.connectedNodes("node[cls='Playbook']");

        
        if(nodes_in_topic.length > 0){
                 //var nodes_in_topic_ids = nodes_in_topic.map(n => n.id());
                // console.log("playbook_node",nodes_in_topic_ids);
                // console.log("his.graphService.instance.$id(nodes_in_topic_ids[0]).data()",this.graphService.instance.$id(nodes_in_topic_ids[0]).data().cls)
                // var isPlaybook=this.graphService.instance.$id(nodes_in_topic_ids[0]).data().cls;
              
                // var oid=this.graphService.instance.$id(nodes_in_topic_ids[0]).data().oid.toString()
                // console.log("oid",generateLink(oid))
                // window.open(generateLink(oid))
                
                Action.trigger(ActionTypes.SELECT_PLAYBOOK, { node: nodes_in_topic[0].id() });
                //this.onlyCollapseNodeId(nodes_in_topic[0].id())

            
        }
    }

    setIncludeKeywords(keywords) {
        let rules = Object.assign({}, this.rules);
        rules.includeKeywords = new Set(keywords);
        this.setRules(rules);
    }
    
    setExpandedNodes(nodeIds) {

        let rules = Object.assign({}, this.rules);
        rules.includeManualAndExpand = new Set(nodeIds);
        this.setRules(rules);
    }

    setIncludeManualNodes(nodeIds) {
        let rules = Object.assign({}, this.rules);
        rules.includeManual = new Set(nodeIds);
        this.setRules(rules);
    }

    toggleExpandedNodeId(nodeId) {
        if(!this.graphService.instance.$id(nodeId).isNode()) {
            console.error('VisibilityService.toggleExpandedNodeId Trying to use non-existant nodeId=', nodeId);
        }

        if(this.rules.includeManualAndExpand.has(nodeId)) {
            this.rules.includeManualAndExpand.delete(nodeId);
        } else {
            this.rules.includeManualAndExpand.add(nodeId);
        }
        this.setRules(this.rules);
    }
    onlyExpandedNodeId(nodeId) {
        if(!this.graphService.instance.$id(nodeId).isNode()) {
            console.error('VisibilityService.toggleExpandedNodeId Trying to use non-existant nodeId=', nodeId);
        }
        

        if(this.rules.includeManualAndExpand.has(nodeId)) {
           this.rules.includeManualAndExpand.add(nodeId);
        } else {
            this.rules.includeManualAndExpand.add(nodeId);
        }
        console.log("his.rules.includeManualAndExpand",this.rules)
        this.setRules(this.rules);
    }
     onlyCollapseNodeId(nodeId) {
        if(!this.graphService.instance.$id(nodeId).isNode()) {
            console.error('VisibilityService.toggleExpandedNodeId Trying to use non-existant nodeId=', nodeId);
        }
        this.rules.includeManualAndExpand.delete(nodeId);
       
        this.setRules(this.rules);
    }

    toggleIncludeManualNodeId(nodeId) {
        if(!this.graphService.instance.$id(nodeId).isNode()) {
            console.error('VisibilityService.toggleIncludeManualNodeId Trying to use non-existant nodeId=', nodeId);
        }

        if(this.rules.includeManual.has(nodeId)) {
            this.rules.includeManual.delete(nodeId);
        } else {
            this.rules.includeManual.add(nodeId);
        }
        this.setRules(this.rules);
    }

    includeManualNodeId(nodeId) {
        if(!this.graphService.instance.$id(nodeId).isNode()) {
            console.error('VisibilityService.includeManualNodeId Trying to use non-existant nodeId=', nodeId);
        }
        this.rules.includeManual.add(nodeId);
    }

    resetExpandedNodes() {
        this.rules.includeManualAndExpand = new Set();
        this.setRules(this.rules);
    }

    resetIncludeManual() {
        this.rules.includeManual = new Set();
        this.setRules(this.rules);
    }

    getEmptyRules() {
        return {
            'includeClasses': new Set(),
            'includeTopics': new Set(),
            'includeKeywords': new Set(),
            'includeManualAndExpand': new Set(),
            'includeManual': new Set(),
        };
    }

    resetAll() {
        this.clearCallbacks.forEach(cb => cb());
        this.setRules(this.getEmptyRules());
    }

    resetFilters() {
        this.clearCallbacks.forEach(cb => cb());
        let newRules = Object.assign(this.getEmptyRules(), {
            'includeManual': this.getRules().includeManual,
            'includeManualAndExpand': this.getRules().includeManualAndExpand,
        });
        this.setRules(newRules);
    }

}


