import _ from 'lodash';
import { View } from './View';
import { FilterTree } from './FilterTree';
import { Action, ActionTypes } from './Action';

export class GraphFilterSidebarView extends View {
    constructor(container, graphService, visibilityService) {
        super(container);


        this.graphService = graphService;
        this.visibilityService = visibilityService;

        this.filterTree = new FilterTree(
            visibilityService.getRules().includeClasses,
            (includeClasses) => {
                visibilityService.setIncludeClasses(includeClasses);
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

        if(!this.graphService.schema) {
            console.error('GraphFilterSidebarView.render: Cannot render, no schema.');
            return [];
        }

        let classNode = this.graphService.getInstanceClassByName('Any');
        if(classNode.length < 1) {
            console.error('GraphFilterSidebarView.render: Cannot render, no Any class found');
            return [];
        }

        return this.getTreeDataForClass(classNode);
    }

    onFilterItemClick(x) {
        console.log('clicked, ', x);
        let clsNode = app.graphService.schema.$(`node[name="${x._text}"]`);
        Action.triggerElement(this.getContainer(), ActionTypes.SELECT_CLASS, { class_name: x._text, class_node: clsNode });
    }

    getTreeDataForClass(classNode) {
        if(classNode.length <= 0) {
            console.error('GraphFilterSidebarView.getTreeDataForClass: No class node given');
            return null;
        }

        let cmpNodes = (a, b) => {
            let aName = a.data().props.name;
            let bName = b.data().props.name;
            let cmp = (aName === bName) ? 0 : (aName > bName) ? 1 : -1;
            return cmp;
        };

        let childClassNodes = this.graphService.getInstanceClassImmediateChildren(classNode).sort(cmpNodes);
        //console.log('childClassNodes=', childClassNodes);
        let childNodesData = childClassNodes.map( (node) => this.getTreeDataForClass(node) );

        let nodeName = classNode.data().props.name;
        let nodeData = {
            text: nodeName,
            // buildStyleOverride()
            // from https://github.com/jonmiles/bootstrap-treeview/blob/master/src/js/bootstrap-treeview.js#L622
            // causes a style= prop on each node with invalid ("color: undefined") value if these aren't set.
            // color: '',
            // backColor: '',
            state: {
                checked: this.visibilityService.getRules().includeClasses.has(nodeName),
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
