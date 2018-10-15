import treeview$ from 'exports-loader?jQuery!bootstrap-treeview/dist/bootstrap-treeview.min.js';
window.treeview$ = treeview$;

export class FilterTree {
    constructor(defaultChecked, onChange, getData, itemAction) {
        this.checked = Array.from(defaultChecked);
        this.treeview = undefined;
        this.onChange = onChange;
        this.getData = getData;
        this.itemAction = itemAction;
    }

    // // Some problem in the library, doesn't seem to work
    // setChecked(checked) {
    //     if(new Set(checked).isEqual(new Set(this.checked))) { return; }
    //
    //     this.checked = checked;
    //     if(this.treeview) { // may not have renderd yet
    //         let _checked = Array.from(checked);
    //         this.treeview.uncheckAll({silent: true});
    //         this.treeview.checkNode(_checked, {silent: true});
    //         this.treeview.checkNode(_checked[0]);
    //     }
    //
    // }

    uncheckAll() {
       
        if(this.treeview) {
            this.treeview.uncheckAll({silent: true});
            this.treeview.checkNode(0, {silent: true});
            this.treeview.uncheckNode(0);
        }
    }
    

    render() {
        let this_ = this;

        let onChangeFn = () => {
            let checkedData = this.treeview.getChecked();
            let checked  = checkedData.map( (n) => n._text );

            this.checked = checked;
            if(this.onChange) {
                this.onChange(checked);
            }
        };

        let data = this.getData();

        let findNode = (nodes, myId) => {
            for(var i = 0; i < nodes.length; ++i) {
                let node = nodes[i];
                // console.log('cmp', node, node._myId, myId);
                if(node._myId === myId) {
                    return node;
                } else if(node.nodes && node.nodes.length > 0) {

                    return findNode(node.nodes, myId);

                }
            }
            return null;
        };

        let getChildIds = (nodeId) => {
            let node = this_.treeview.getNode(nodeId);
            if(node && node.nodes) {
            
                return [].concat.apply([], node.nodes.map( n => [n.nodeId].concat(getChildIds(n.nodeId)) ));
            }
            return [];
        };

        let mkBtnEle = (name, myId, data={}) => function(index, html) {
            console.log('btnele n=', name, ' data=', data);
            //debugger;
            let checked = this_.treeview ?
                (this_.treeview.getChecked().filter(el => el._myId === myId).length > 0)
                : (data.state && data.state.checked);
            // this_.checked.includes(name); // TODO: this is a bit clunky.
            console.log("myId",myId)
            let icon = checked ? 'fa-times-circle' : 'fa-check-circle';
            let hasChildren = data.nodes && data.nodes.length > 0;

            let jqLabel = $('<div class="tree-label" style="display: inline;">')
                .text(name)
                .attr('data-myid', myId);

            if (hasChildren) {
                jqLabel.append(
                    $('<a class="tree-child-toggle btn btn-default btn-xs pull-right">' +
                      '<i class="fa ' + icon + ' "></i></a>')
                        .tooltip({title: checked ? 'Hide all children' : 'Show all children', placement: 'auto'})
                );
            }
            return jqLabel;

        };

        var nodeIdNext = 100;
        let addBtns = (data) => {
            let name = data.text;
            let myId = nodeIdNext++;
            data._text = name;
            data._myId = myId;

            data.text = mkBtnEle(name, myId, data);

            if(data.nodes && data.nodes.length > 0) {
                data.nodes.forEach( (n) => addBtns(n) );
            }
        };

        addBtns(data);

        let treeData = [ data ];
        console.log('FilterTree.render treeData=', treeData);
        let div = treeview$('<div>').treeview({
            data: treeData,
            color: '#222222',
            backColor: '#f0f0f0',
            levels: 1,
            showCheckbox: true,
            highlightSelected: false,
            onNodeChecked: onChangeFn,
            onNodeUnchecked: onChangeFn,
        });
        this.treediv = div;
        this.treeview = treeview$(div).treeview(true);

        div.on('click', 'div.tree-label, a.tree-child-toggle', (ev) => {
            console.log("ev===========>",ev)
            alert('----on click----');

            let $target = $(ev.currentTarget);
            let parentId = parseInt($target.closest('li[data-nodeid]').attr('data-nodeid'));
            let myId = parseInt($target.closest('div[data-myid]').attr('data-myid'));
            console.log('parent ID=', parentId, ' myid=', myId);
            
            if ($target.hasClass('tree-child-toggle')) {
                console.log('tryiing to toggle things');
                let myNode = findNode( [this.treeview.getNode(parentId)], myId );
                let myNodeId = myNode.nodeId;
                let childIds = getChildIds(myNodeId);
    
                if(myNode.state.checked) {
                    // uncheck this and all children
                    alert('chaked')
                    this_.treeview.uncheckNode(childIds, { silent: true });
                    this_.treeview.uncheckNode(myNodeId);

                } else {
                    // check this and all children
                    alert('unchaked')
                    this_.treeview.checkNode(childIds, { silent: true });
                    this_.treeview.checkNode(myNodeId);
                    //this_.treeview.uncheckNode(childIds, { silent: true });
                    //this_.treeview.uncheckNode(myNodeId);
                }
            } else if ($target.hasClass('tree-label')) {

                let nodeData = this.treeview.getNode(parentId);
                console.log('going to select ', nodeData);
                if (this.itemAction) {
                    this.itemAction(nodeData);
                }
            }

            ev.preventDefault();
            ev.stopImmediatePropagation();

        });

        return div;
    }
   
};
