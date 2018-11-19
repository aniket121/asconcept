import _ from 'lodash';
import { View } from './View';
import { FilterTree } from './FilterTree';
import { Action, ActionTypes } from './Action';

export class TopicFilterSidebarView extends View {
    constructor(container, graphService, visibilityService) {
        super(container);


        this.graphService = graphService;
        this.visibilityService = visibilityService;

        this.filterTree = new FilterTree(
            visibilityService.getRules().includeTopics,
            (includeTopics) => {
                visibilityService.setIncludeTopics(includeTopics);
            },
            () => {
                return this.getData();
            },
            (x) => this.onFilterItemClick(x)
        );

        this.graphService.onInstanceUpdate((allcy) => {
            this.reRender();
        });

        this.visibilityService.registerClearCallback(() => {
            this.filterTree.uncheckAll();
        });

    }

    getData() {
        if(!this.graphService.instance) {
            console.error('TopicFilterSidebarView.render: Cannot render, instance graph not loaded.');
        }

        let classNode = this.graphService.getTopicByName('All Topics');
        if(classNode.length < 1) {
            console.error('TopicFilterSidebarView.render: Cannot render, no All Topics topic found');
        }

        return this.getTreeDataForTopic(classNode);
    }

    onFilterItemClick(x) {
        
        console.log('topic clicked, ', x);
        let topicNode = window.app.views.topics.cy.$(`node[prop_name="${x._text}"]`);
        Action.triggerElement(this.getContainer(), ActionTypes.SELECT_TOPIC, {
            "node": topicNode,
        });

    }

    getTreeDataForTopic(topicNode) {
        if(topicNode.length <= 0) {
            console.error('TopicFilterSidebarView.getTreeDataForTopic: No class node given');
            return null;
        }

        let cmpNodes = (a, b) => {
            let aName = a.data().props.name;
            let bName = b.data().props.name;
            let cmp = (aName === bName) ? 0 : (aName > bName) ? 1 : -1;
            return cmp;
        };

        let childNodes = this.graphService.getTopicImmediateChildren(topicNode).sort((a, b) => a.data().props.name - b.data().props.name).sort(cmpNodes);
        let childNodesData = childNodes.map( (node) => this.getTreeDataForTopic(node) );

        let nodeName = topicNode.data().props.name;
        let includeTopics = this.visibilityService.getRules().includeTopics;
        let nodeData = {
            text: nodeName,
            state: {
                checked: includeTopics ? includeTopics.has(nodeName) : false,
            },
        };

        if(childNodesData.length > 0) {
            nodeData['nodes'] = childNodesData;
        }
        return nodeData;
    }

    render() {
        return this.filterTree.render();
    }
}
