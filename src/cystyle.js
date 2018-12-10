import cytoscape from 'cytoscape';

function nodeMeta(ele) {
    return (ele.data().meta)? ele.data().meta : {};
}

function nodeContentFn(ele) {
    let data = ele.data();
    let meta = nodeMeta(ele);
    let display = data.display;
    let suffix = (meta.numHiddenEdges && meta.numHiddenEdges > 0)? '['+meta.numHiddenEdges+']' : '';
    return '' + display + ' ' + suffix;
}


// Generic stylesheet
export const cytoscapeStylesheet = cytoscape.stylesheet()
    .selector('node')
    .css({
        'content': nodeContentFn,
        'border-style': 'double',
        'border-width': (ele) => (nodeMeta(ele).pinned || nodeMeta(ele).isExpanded)? 5 : 0,
        'border-color': (ele) => (nodeMeta(ele).pinned)? 'red' : 'blue',
        'text-valign': 'bottom',
        'color': 'black',
        'text-outline-width': 2,
        'background-color': 'data(colour)',
        'text-outline-color': '#FFF',
        'font-size': '1em',
        'background-blacken': 0,
        'text-wrap': 'wrap',
        'text-max-width': '100px',
    })
    .selector('edge')
    .css({
        'content': 'data(display)',
        //'curve-style': 'bezier',
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#ccc',
        'line-color': '#ccc',
        'width': 1.5,
        'font-size': '0.7em',
        "edge-text-rotation": "autorotate",
        'text-opacity': 1.0,
        'opacity': 0.9,
    })
    .selector('edge:selected')
    .css({
        'line-color': 'black',
        "text-outline-color": "#ccc",
        'text-color': 'black',
        "text-outline-width": 3
        // 'target-arrow-color': 'black',
        // 'source-arrow-color': 'black'
    })
    .selector('node:selected')
    .css({
        'line-color': 'black',
        'overlay-color': 'blue',
        'overlay-opacity': 0.3,
        'overlay-padding': 0,
        
        'background-blacken': 0.5,
        // 'target-arrow-color': 'black',
        // 'source-arrow-color': 'black'
    })
    .selector('.node-Binding')
    .css({
        'shape': 'triangle',
        'width': '20px',
        'height': '20px',
    })
    .selector('.faded')
    .css({
        'opacity': 0.5,
    });
