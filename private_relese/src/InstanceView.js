import _ from 'lodash';
import { GraphView } from './GraphView';
import cytoscape from 'cytoscape';
import cycola from 'cytoscape-cola';
import { Action, ActionTypes } from './Action';
//import { applyFilterRules } from './FilterRules';
import { CytoQuery } from './CytoFilter';

cytoscape.use(cycola);

function setsAreEqual(a, b) {
    return (a.size === b.size) && (Array.from(a).filter(x => !b.has(x)).length === 0);
}

export class InstanceView extends GraphView {
    constructor(container, graphService, visibilityService, urlService) {
        super(container);

        this.graphService = graphService;
        this.visibilityService = visibilityService;
        this.urlService = urlService;

        this.allowSelectTrigger = true;
        this.previousSelection = new Set([]);

        this.isInitialLayout = true;

        this.initialLayout = {
            randomize: true,
            name: 'cola',
            fit: false, // we want to happen at the end of the layout, not the start.
            handleDisconnected: true,
            infinite: false,
            ungrabifyWhileSimulating: true,
            nodeDimensionsIncludeLabels: true,
            animate: true,
            refresh: 1,
            maxSimulationTime: 2000,
            edgeLength: 130,
            ready: (ev) => {
                console.log('initialLayout ready()');
            },
            stop: (ev) => {
                console.log('initialLayout stop()');
            },
            convergenceThreshold: 0.05,
        };

        this.defaultLayout = {
            // https://github.com/cytoscape/cytoscape.js-cola#api
            //            randomize: () => !!(this.isInitialLayout),
            randomize: false,
            name: 'cola',
            animate: true, //() => !(document.hidden),
            refresh: 2,
            maxSimulationTime: 15000,
            fit: false,
            handleDisconnected: true,
            infinite: false,
            ungrabifyWhileSimulating: false,
            nodeDimensionsIncludeLabels: true,
            convergenceThreshold: 0.1,
            ready: (ev) => {
                console.log('cola layout ready ', ev.type);
                //ev.target.cy().reset();
                //this.cy.fit();
                //console.log('orphans=', orphans);
                this.layout_running = true;
                //this.cy.animate({ fit: { eles: this.cy.nodes(), padding: 20 } }, { duration: 300 });
            },
            stop: (ev) => {
                this.layout_running = false;

                let layout = ev.target;
                console.log('cola layout stop, stats=', layout.stats);
                layout.cy().nodes().unlock();
                // this.cy.animate({
                //     fit: { eles: this.cy.nodes(), padding: 20 }
                // }, { duration: 300 });
                if (this.isInitialLayout) {
                    this.isInitialLayout = false;
                    this.cy.animate({
                        fit: { eles: this.cy.nodes(), padding: 20 }
                    }, { duration: 300 });

                }
            },
            unconstrIter: 10,
            userConstIter: 10,
            allConstIter: 0,
            gridifyIter: 5,
            edgeLength: (ed) => {
                let nodes = ed.connectedNodes();
                let degs = nodes.minDegree();
                // if (ed.data().cls === 'HasSubTopic') {
                //     return 100;
                // }
                return 100 + (60 * Math.sqrt(degs-1));
                // if (degs > 1) {
                //     return 200;
                // } else {
                //     return 100;
                // }
//                return 100 + (20 * degs);
            },
            //nodeSpacing: (n) => { return 10 * (n.degree() + 1); }
        };

        let _onSelectFn = (e) => {
            _.defer(() => {
            e.target.select();
            let selection = this.cy.$('node:selected').map(node => node.id());
            if(!this.allowSelectTrigger) { return; }
            if(selection.length === 0) { return; }

            // only trigger a new action if the previous selection isn't the same
            // to deal with the fact that cytoscape triggers once per selected thing
            // and we reset previousSelection on any other kind of selection
            if(!setsAreEqual(new Set(selection), this.previousSelection)) {
                Action.triggerElement(this.getContainer(), ActionTypes.SELECT_INSTANCES, {
                    "nodes": this.cy.$('node:selected').map(node => node.id()),
                });
                e.preventDefault();
                e.stopPropagation();
            }
            });
        };

        this.cy.on('boxselect', 'node', _onSelectFn);
        this.cy.on('tap', 'node', _onSelectFn);

        this.cy.on('tap', (e) => {
            if(e.target == this.cy) {
                Action.triggerElement(this.getContainer(), ActionTypes.SELECT_NONE, {});
            }
        });

        this.cy.on('tap', 'edge', (e) => {
            Action.triggerElement(this.getContainer(), ActionTypes.SELECT_INSTANCE_EDGE, { edge: e.target });
        });

        let fadeOutFn = ($z) => {
            $z.clearQueue().fadeOut(500);
        };
        let fadeOutDeb = _.debounce(fadeOutFn, 1000);
        let throtFade = _.throttle(($z) => {
            $z.show();
            $z.text((this.cy.zoom() * 100).toFixed(2) + '%');
            fadeOutDeb.cancel();
            fadeOutDeb($z);
        }, 100);

        this.cy.on('zoom', (e) => {
            let $zinfo = $('#lhszoominfo');
            throtFade($zinfo);
        });

        Action.on(ActionTypes.SELECT_NONE, (e, data) => {
            this.previousSelection = new Set([]);
        });

        Action.on(ActionTypes.SELECT_INSTANCE_EDGE, (e, data) => {
            var cy = this.cy;
            var edge = cy.$id( data.edge.id() );
            console.log('selected edge', edge);
            edge.select();
        });

        // on SELECT_INSTANCE, show just that instance and it's neighborhood
        Action.on(ActionTypes.SELECT_INSTANCES, (e, data) => {
            var cy = this.cy;
            var visibleNodesList = data.nodes.map( id => cy.$id(id) ).filter(o => o.length > 0);
            if(window.location.href.indexOf("playbook_openOid") == -1 && visibleNodesList[0].data().cls =="Playbook"){
            Action.trigger(ActionTypes.SELECT_PLAYBOOK, { node: visibleNodesList[0].id() });
            }
            var nodes = cy.collection(visibleNodesList);
            //this.deselectAll();
            //cy.elements().unselect();
            //console.log('current sel=', cy.$('node:selected').map(node => node.id()));
            //cy.nodes().unselect();
            nodes.select();
        });

        // on SELECT_CLASS, show all instances of that class
        Action.on(ActionTypes.SELECT_CLASS, (e, data) => {
            this.previousSelection = new Set([]);
            var cy = this.cy;
            console.log('SELECT_CLASS', data);
            var class_name = data.class_name;

            let nodes = cy.$("[cls='" + class_name + "']");
            nodes.select();
        });

        // on SELECT_TOPIC, show all instances that have that topic
        Action.on(ActionTypes.SELECT_TOPIC, (e, data) => {
            this.previousSelection = new Set([]);
            var cy = this.cy;
            var topic_name = data.node.data().props.name;
            var topic_node = this.graphService.instance.$("node[cls='Topic'][prop_name='" + topic_name + "']");
            var hastopic_edges = topic_node.connectedEdges("edge[cls='HasTopic']");
            var nodes_in_topic = hastopic_edges.connectedNodes("[cls != 'Topic']");

            if(nodes_in_topic.length > 0) {
                // it is neccessary to convert via id's from graphService.instance to this.cy
                var nodes_in_topic_ids = nodes_in_topic.map(n => n.id());
                let toselect = nodes_in_topic_ids.filter(id => cy.$id(id).length > 0).map(id => cy.$id(id));
                toselect.forEach(n => n.select());
            }

        });

        this.visibilityService.registerCallback( (rules, extraOptions) => {
            this.onVisibilityChange(rules, extraOptions);
        });

        // this.cy.on('grabon', 'node', _.throttle((goe) => {
        //     this.cy.one('drag', 'node', (de) => {
        //         console.log('drag start');
        //         this.cy.one('free', 'node', (fe) => {
        //             console.log('drag end?');
        //             let node = fe.target;
        //             node.lock();
        //             if (!this.layout_running) {
        //                 console.log('triggering relayout');
        //                 this.layout_running = true;
        //                 this.layout.run();
        //             }
        //         });
        //     });
        // }), 1000);
        let mkCtxCommand = (command, name, icon, enabled) => {
            return {
                content: `<span class="fa ${icon}"></span> ${name}`,
                select: command,
                disabled: !enabled,
                fillColor: 'rgba(0,0,0,' + (enabled?'0.8': '0.2') + ')'
            };
        };

        this.cy.cxtmenu({
		    	  selector: 'node',
            activePadding: 5,
		    	  commands: (nele) => {
                let ndata = nele.data();
                let nmeta = ndata.meta || {};
                let selection = this.getSelectedNodes();
                let mselect = selection.length > 1;
                let cmds = [];
                if (mselect) {
                    cmds.push(mkCtxCommand((ele) => {
                        selection.forEach(node => {
                            node.data('meta').pinned || this.visibilityService.toggleIncludeManualNodeId(node.id());
                        });
		    			      }, 'Pin all', 'fa-thumb-tack', true));

                    cmds.push(mkCtxCommand((ele) => {
                        selection.forEach(node => {
                            node.data('meta').pinned && this.visibilityService.toggleIncludeManualNodeId(node.id());
                        });
		    			      }, 'Unpin all', 'fa-thumb-tack', true));

                    cmds.push(mkCtxCommand((ele) => {
                        selection.forEach(node => {
                            node.data('meta').isExpanded || this.visibilityService.toggleExpandedNodeId(node.id());
                        });
		    			      }, 'Expand all', 'fa-expand', true));

                    cmds.push(mkCtxCommand((ele) => {
                        selection.forEach(node => {
                            node.data('meta').isExpanded && this.visibilityService.toggleExpandedNodeId(node.id());
                        });
		    			      }, 'Collapse all', 'fa-compress', true));

                } else {
                    if (nmeta.isExpanded) {
                        cmds.push(mkCtxCommand((ele) => {
                            this.visibilityService.toggleExpandedNodeId(ele.id());
		    			          }, 'Collapse', 'fa-compress', true));
                    } else {
                        let canExpand = nmeta.numHiddenEdges > 0;
                        cmds.push(mkCtxCommand((ele) => {
                            this.visibilityService.toggleExpandedNodeId(ele.id());
		    			          }, 'Expand', 'fa-expand', canExpand));
                    }

                    if(nmeta.pinned) {
                        cmds.push(
                            mkCtxCommand((ele) => {
                                this.visibilityService.toggleIncludeManualNodeId(ele.id());
		    			              }, 'Unpin', 'fa-thumb-tack', true)
                        );
                    } else {
                        cmds.push(
                            mkCtxCommand((ele) => {
                                this.visibilityService.toggleIncludeManualNodeId(ele.id());
		    			              }, 'Pin', 'fa-thumb-tack', true)
                        );
                    }
                }
                cmds = [...cmds,
                    mkCtxCommand((ele) => {
                        let url = this.urlService.generateNodeUrlHash(ele.id());
                        prompt('Copy this URL, for '+ ele.data().cls +' '+ ele.data().props.name +':', url);

     			          }, 'Link', 'fa-share-square-o', true),

                    mkCtxCommand((ele) => {
                        if(this.getSelectedNodes().length <= 0) {
                            this.highlightNodes(ele);
                        } else {
                            this.highlightSelected();
                        }
                    }, 'Highlight', 'fa-eye', true),

                    mkCtxCommand((ele) => {}, 'Cancel', 'fa-arrow-left', true),
		    	      ];

                return cmds;
            }
		    });
    }

    deselectAll() {
        this.allowSelectTrigger = false;
        this.cy.elements().unselect();
        this.allowSelectTrigger = true;
    }
    onInitialLayout() {
        this.initialLayout();
    }

    initialLayout() {
        console.log('initial layout');
        if (this.layout) {
            this.layout.stop();
        }
        this.layout = this.cy.layout(this.initialLayout);
        this.layout.run();
    }
    onRelayout() {
        console.log('relayout');

    }
    onLayout(forceRefit=true) {
        // let orphans = this.cy.nodes('[[degree = 0]]');
        // orphans.layout({name: 'grid'}).run();
        // orphans.lock();

        //this.cy.remove(this.cy.nodes().filter((n) => n.degree() == 0))

        console.log('DOING A RELAYOUT ++++++++++');

        if (forceRefit) {
            this.isInitialLayout = true;
        }
        if (this.layout) {
            this.layout.stop();
        }

        if(this.cy.elements().length > 0) {
            this.layout = this.cy.layout(this.defaultLayout);
            if (!document.hidden) {
                this.layout.run();
            } else {
                $(document).one('visibilitychange', (ev) => {
                    _.defer(() => this.layout.run());
                });
            }
        }
    }

    onVisibilityChange(rules, extraOptions) {
        if (this.layout) {
            this.layout.stop();
        }

        let reload = extraOptions.reload ? true : false;
        var result;

        this.cy.batch(() => {

            if(reload) {
                this.nodePositions = {};
                this.cy.nodes().forEach((n) => {
                    let oid = n.data().oid;
                    this.nodePositions[oid] = n.position();
                });
                this.cy.elements().remove();
            }

            let q = this.visibilityService.getCytoQuery();

            result = q.applyTo(this.cy);

            if(reload) {
                Object.keys(this.nodePositions).forEach(id => {
                    let foundNode = this.cy.$id(id);
                    if(foundNode.length > 0) {
                        foundNode.position(this.nodePositions[id]);
                    }
                });
            }

        });

        console.log('InstanceView.onVisibilityChange', 'reload=', reload, 'result=', result);

        if(reload || result.numAddedNodes > 0 || result.numRemovedNodes > 0) {
            this.onLayout();
        }
    }

    onDispose() {
        super.onDispose();
        if (this.layout) {
            this.layout.stop();
            this.layout = undefined;
        }
    }
}
