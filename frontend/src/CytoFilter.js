import cytoscape from "cytoscape";

// Example:
// filterRules = {
//     includeClasses: ["Document", "Role", ...],
//     includeTopics: ["Confidentiality", "Data Protection", ...],
//     includeKeywords: ["mandatory", "disclosures", "duration", ...],
//     includeManualAndExpand: ["1234", "7342", ...]
// }

// Various allcy => cy filtering options, to include/exclude nodes from cy
export class CytoQuery {

    constructor(graphService) {
        this.graphService = graphService;
        this.nodeSet = new Set();
        this.nodeMeta = {};
    }

    // Make the target cytoscape instance equivelant to the internal filtered instance
    applyTo(tocy) {
        let nodeSet = this.nodeSet;
        var numRemovedNodes;
        var numAddedNodes;

        tocy.batch( () => {
            // Remove all elements from tocy that are not in ourcy
            let removedNodes = new Set();
            tocy.nodes().forEach( (e) => {
                // if the element exists in our nodeSet
                if(nodeSet.has(e.id())) {
                    //keep it
                } else {
                    //if not, get rid of it
                    this._cyRemoveNodeById(tocy, e.id());
                    removedNodes.add(e.id());
                }
            });

            // Add all to tocy that are in our nodeSet but not in tocy, then add their edges
            // We have to add all the nodes before adding all the edges, because a node might
            // have edges to a node that doesn't exist yet, but will be created.
            let addedNodes = new Set();

            nodeSet.forEach( id => {
                if(tocy.$id(id).length <= 0) {
                    this._cyAddNodeById(tocy, id);
                    addedNodes.add(id);
                }
            });

            addedNodes.forEach( (id) => {
                this._cyAddNodeEdgesById(tocy, id);
            });

            // Update the numHiddenEdges for neighbors of removed nodes and neighbors of added nodes
            let allcy = this.graphService.instance;
            let removedCollection = allcy.collection(Array.from(removedNodes).map(id => allcy.$id(id)));
            let removedNeighbors  = removedCollection.openNeighborhood().nodes();
            let addedCollection   = allcy.collection(Array.from(addedNodes).map(id => allcy.$id(id)));
            let addedNeighbors    = addedCollection.closedNeighborhood().nodes();

            removedNeighbors.forEach( (ele) => {
                let numHiddenEdges = this._getNodeNumHiddenEdges(nodeSet, ele.id());
                this._setNodeMeta(ele.id(), 'numHiddenEdges', numHiddenEdges);
            });

            addedNeighbors.forEach( (ele) => {
                let numHiddenEdges = this._getNodeNumHiddenEdges(nodeSet, ele.id());
                this._setNodeMeta(ele.id(), 'numHiddenEdges', numHiddenEdges);
            });

            // Apply metadata
            tocy.nodes().forEach((n) => {
                this._cyApplyNodeMeta(tocy, n.id(), this._getNodeMeta(n.id()));
            });

            numRemovedNodes = removedNodes.size;
            numAddedNodes = addedNodes.size;
        });

        return {
            'numRemovedNodes': numRemovedNodes,
            'numAddedNodes': numAddedNodes,
        };
    }

    _cyRemoveNodeById(cy, nodeId) {
        let node = cy.$id(nodeId);

        if(node.length > 0) {
            // node exists, we need to exclude it
            // first remove the node's edges
            cy.remove( node.connectedEdges() );
            // then the node itsself
            cy.remove( node );

        } else {
            // node doesn't exist, good
        }

        return this;
    }

    _cyApplyNodeMeta(cy, nodeId, extraMeta) {
        let currentMeta = cy.$id(nodeId).data().meta;
        let meta = Object.assign(currentMeta ? currentMeta : this._defaultNodeMeta(), extraMeta);
        let node = cy.$id(nodeId);

        //console.log('META nodeId=', nodeId, 'currentMeta=', currentMeta, 'extraMeta=', extraMeta, 'meta=', meta);
        node.data("meta", meta);

        // doesn't work, cytoscape doesn't update the styles??
        // if(meta.pinned) {
        //     node.style({
        //         'border-width': 2,
        //         'border-style': 'solid',
        //     });
        // } else if(meta.isExpanded) {
        //     node.style({
        //         'border-width': 2,
        //         'border-style': 'dotted',
        //     });
        // } else {
        //     node.removeStyle();
        // }
    }

    _cyAddNodeById(cy, nodeId) {
        let allcy = this.graphService.instance;
        let node = cy.$id(nodeId);

        if(node.length > 0) {
            // node exists

        } else {
            // we need to include this node in cy
            let ele = allcy.$id(nodeId);
            if(ele.length > 0) {
                // found the desired node
                cy.add( ele.clone() );

            } else {
                console.warn("CytoFilter trying to include node that doesn't exist!");
            }
        }

        return this;
    }

    _defaultNodeMeta() {
        return {
            'pinned': false,
            'isResultOfExpansion': false,
            'isExpanded': false,
        };
    }

    _getNodeMeta(nodeId) {
        if(this.nodeMeta[nodeId]) {
            return this.nodeMeta[nodeId];
        } else {
            return this._defaultNodeMeta();
        }
    }

    _setNodeMeta(nodeId, attr, val) {
        if(!this.nodeMeta[nodeId]) {
            this.nodeMeta[nodeId] = this._defaultNodeMeta();
        }
        this.nodeMeta[nodeId][attr] = val;
    }

    _cyAddNodeEdgesById(cy, nodeId) {
        let allcy = this.graphService.instance;
        let anode = allcy.$id(nodeId);
        let node = cy.$id(nodeId);

        if(anode.length < 1) {
            console.warn("CytoQuery trying to add edges for node that doesn't exist in allcy!");
            return false;
        }

        if(node.length < 1) {
            console.warn("CytoQuery trying to add edges for node that doesn't exist!");
            return false;
        }

        // add it's edges to neighbors if they exist in cy
        anode.connectedEdges().forEach( (edge) => {
            if(edge.source().id() === nodeId) {
                // this node is the source of this edge, does the target exist in cy?
                if(cy.$id( edge.target().id() ).length > 0) {
                    // add the edge
                    cy.add( edge.clone() );
                }

            } else if(edge.target().id() === nodeId) {
                // this node is the target if this edge, does the source exist in cy?
                if(cy.$id( edge.source().id() ).length > 0) {
                    // add the edge
                    cy.add( edge.clone() );
                }

            } else {
                // this shouldn't happen
                console.warn("CytoFilter found an edge with the node as neither target nor source");
            }
        });

        return this;
    }

    _getNodeNumHiddenEdges(nodeSet, nodeId) {
        let allcy = this.graphService.instance;
        let anode = allcy.$id(nodeId);

        if(anode.length < 1) {
            console.warn("CytoQuery trying to calculate hidden edges for node that doesn't exist in allcy!");
            return false;
        }

        var numHiddenEdges = 0;
        anode.connectedEdges().forEach( (edge) => {
            if(edge.source().id() === nodeId) {
                // this node is the source of this edge, does the target exist in nodeSet?
                if(!nodeSet.has(edge.target().id())) {
                    numHiddenEdges++;
                }

            } else if(edge.target().id() === nodeId) {
                // this node is the target if this edge, does the source exist in nodeSet?
                if(!nodeSet.has(edge.source().id())) {
                    numHiddenEdges++;
                }

            } else {
                // this shouldn't happen
                console.warn("CytoFilter found an edge with the node as neither target nor source");
            }
        });

        return numHiddenEdges;
    }

    excludeNodesByIdsNot(nodeIds) {
        let nodeIdsSet = new Set(nodeIds);
        this.nodeSet.forEach( (id) => {
            if(!nodeIdsSet.has(id)) {
                this.excludeNodeById(id);
            }
        });
        return this;
    }

    applyFilterRules(filterRules) {
        let classes = filterRules.includeClasses;
        let topics = filterRules.includeTopics;
        let keywords = filterRules.includeKeywords;
        let expand = filterRules.includeManualAndExpand;
        let manual = filterRules.includeManual;

        // First include everything potentially matching a fiter
        console.log('CytoQuery.applyFilterRules start n=', this.nodeSet.size);

        if(classes && classes.size > 0) {
            this.includeNodesByClasses(classes);
        }
        console.log('CytoQuery.applyFilterRules includeClasses n=', this.nodeSet.size);

        if(topics && topics.size > 0) {
            this.includeNodesByTopics(topics);
        }
        console.log('CytoQuery.applyFilterRules includeTopics n=', this.nodeSet.size);

        if(keywords && keywords.size > 0) {
            this.includeNodesByKeywords(keywords);
        }
        console.log('CytoQuery.applyFilterRules includeKeywords n=', this.nodeSet.size);


        // Then exclude everything not matching a filter
        if(classes && classes.size > 0) {
            this.excludeNodesByClassesNot(classes);
        }
        console.log('CytoQuery.applyFilterRules excludeClasses n=', this.nodeSet.size);

        if(topics && topics.size > 0) {
            this.excludeNodesByTopicsNot(topics);
        }
        console.log('CytoQuery.applyFilterRules excludeTopics n=', this.nodeSet.size);

        if(keywords && keywords.size > 0) {
            this.excludeNodesByKeywordsNot(keywords);
        }
        console.log('CytoQuery.applyFilterRules excludeKeywords n=', this.nodeSet.size);

        // Then include and expand the manually selected (for expansion )nodes
        if(expand && expand.size > 0) {
            this.includeNodesAndExpand(expand);
        }
        console.log('CytoQuery.applyFilterRules includeNodesAndExpand n=', this.nodeSet.size);

        // Finally include manual nodes
        if(manual && manual.size > 0) {
            this.includeNodesByIds(manual);
        }
        console.log('CytoQuery.applyFilterRules includeManual n=', this.nodeSet.size);

        // Update node's metadata
        this.nodeSet.forEach(id => {
            this._setNodeMeta(id, "pinned", manual.has(id));
            this._setNodeMeta(id, "isExpanded", expand.has(id));
        });

        return this;
    }

    excludeNodeById(nodeId) {
        this.nodeSet.delete(nodeId);
    }

    includeNodeById(nodeId, metadata) {
        this.nodeSet.add(nodeId);
        if(metadata) {
            this.nodeMeta[nodeId] = Object.assign(metadata, this.nodeMeta[nodeId] ? this.nodeMeta[nodeId] : {});
        }
    }

    excludeNodesByIds(nodeIds) {
        nodeIds.forEach( (n) => { this.excludeNodeById(n); });
        return this;
    }

    includeNodesByIds(nodeIds, metadata) {
        nodeIds.forEach( (n) => { this.includeNodeById(n, metadata); });
        return this;
    }


    excludeNodes(nodes) {
        return this.excludeNodesByIds( Array.from(nodes).map( (n) => n.id() ) );
    }

    includeNodes(nodes) {
        return this.includeNodesByIds( Array.from(nodes).map( (n) => n.id() ) );
    }

    excludeNodesNot(nodes) {
        return this.excludeNodesByIdsNot(Array.from(nodes).map( (n) => n.id() ));
    }

    excludeFilter(filter) {
        return this.excludeNodes( this.graphService.instance.nodes(filter) );
    }

    includeFilter(filter) {
        return this.includeNodes( this.graphService.instance.nodes(filter) );
    }


    excludeNodesByClass(className) {
        return this.excludeFilter('[cls = "' + className + '"]');
    }

    includeNodesByClass(className) {
        return this.includeFilter('[cls = "' + className + '"]');
    }


    includeNodesByClasses(classNames) {
        classNames.forEach( (cls) => this.includeNodesByClass(cls) );
        return this;
    }


    excludeNodesByClassesNot(classNames) {
        let filter = Array.from(classNames).map( (cls) => '[cls != "' +cls+ '"]' ).join('');
        return this.excludeFilter(filter);
    }

    getNodesByTopics(topics) {
        let topicsSet = new Set(topics);
        let topicNodes = this.graphService.instance.nodes().filter( (n) => n.data().cls === "Topic" && topicsSet.has(n.data().props.name) );
        return topicNodes.incomers().edges().filter( (e) => e.data().cls === "HasTopic" ).sources();
    }

    includeNodesByTopics(topics) {
        return this.includeNodes(
            this.getNodesByTopics(topics)
        );
    }

    includeNodesByTopic(topic) {
        return this.includeNodesByTopics([topic]);
    }


    excludeNodesByTopicsNot(topics) {
        return this.excludeNodesNot(
            this.getNodesByTopics(topics)
        );
    }

    includeNodesAndExpand(nodeIds) {
        let allcy = this.graphService.instance;
        let nodes = allcy.collection( Array.from(nodeIds).map( id => allcy.$id(id) ).filter( n => n.length > 0 ) ).nodes();
        let neighborhoodsIds = nodes.map(
            n => n.neighborhood().nodes().map( nn => nn.id() )
        );

        nodes.forEach(
            n => this.includeNodeById(n.id(), { isExpanded: true })
        );

        neighborhoodsIds.forEach(
            neighborhoodIds => neighborhoodIds.forEach(
                id => this.includeNodeById(id, { isResultOfExpansion: true })
            )
        );
    }

    getNodesIdsByKeywords(keywords) {
        let nodeIds = Array.from(
            this.graphService.getKeywordIndex().lookupNodesFromAllKeywords(keywords)
        ).filter( id => this.graphService.instance.$id(id).isNode() );
        return nodeIds;
    }

    includeNodesByKeywords(keywords) {
        return this.includeNodesByIds(
            this.getNodesIdsByKeywords(keywords)
        );
    }

    excludeNodesByKeywordsNot(keywords) {
        return this.excludeNodesByIdsNot(
            this.getNodesIdsByKeywords(keywords)
        );
    }

    getNodeSet() {
        return new Set(this.nodeSet);
    }

}

