import lowerCase from 'lodash.lowercase';

/*    updatePossibleKeywords(cyinstance) {
        let keywordsKeywords = this.getKeywordsFromKeywords(cyinstance.nodes());

        let nodeNamesKeywords = _.uniq( Array.prototype.concat.apply([], nodenamesKeywordsLists).sort() );
        console.log('search nodelist', nodelist, 'kwords', kwords, 'nodenames', nodeNamesKeywords);
        let ret = [].concat(kwords, nodeNamesKeywords);
        this.possibleKeywords = ret;
        return ret;
    }*/

function getKeywordsFromKeywords(nodes) {
    return nodes.filter(n => n.data().props && n.data().props.keywords)
        .map(n => {
            let keywords = n.data().props.keywords;
            return {
                "source": "keyword",
                "nodeId": n.id(),
                "keywords": (typeof keywords === 'string') ? keywords.split(/\s*,\s*/) : (Array.isArray(keywords) ? keywords : []),
            };
        });
}

function getKeywordsFromNames(nodes) {
    return nodes.filter(n => n.data().props && n.data().props.name)
        .map(n => ({
            "source": "name",
            "nodeId": n.id(),
            "keywords": lowerCase(n.data().props.name).split(/\s+/)
        }));
}

function getKeywordsFromClass(nodes) {
    return nodes.filter(n => n.data().cls)
        .map(n => ({
            "source": "class",
            "nodeId": n.id(),
            "keywords": [":" + n.data().cls],
        }));
}

function getKeywords(nodes) {
    return getKeywordsFromKeywords(nodes)
        .concat( getKeywordsFromNames(nodes) )
        .concat( getKeywordsFromClass(nodes) );
}

function SetUnion(a, b) {
    return new Set([...a, ...b]);
}

function SetIntersection(a, b) {
    let r = new Set([...a].filter(x => b.has(x)));
    return r;
}

export class KeywordIndex {
    static newFromGraph(instancecy) {
        let index = new KeywordIndex();
        let nodes = instancecy.nodes();

        getKeywords(nodes)
            .forEach( r => index.addNodeKeywords(r.nodeId, r.keywords) );

        return index;
    }

    constructor() {
        this.possibleKeywords = new Set([]);
        this.possibleNodes = new Set([]);
        this.keyword2nodes = {}; // { keyword: [ node ids... ] }
        this.node2keywords = {}; // { node id: [ keywords... ] }
    }

    add(keyword, nodeId) {
        if(! this.keyword2nodes[keyword]) {
            this.keyword2nodes[keyword] = new Set([]);
        }

        if(! this.node2keywords[nodeId]) {
            this.node2keywords[nodeId] = new Set([]);
        }

        this.keyword2nodes[keyword].add(nodeId);
        this.node2keywords[nodeId].add(keyword);
        this.possibleKeywords.add(keyword);
        this.possibleNodes.add(nodeId);
    }

    addNodeKeywords(nodeId, keywords) {
        keywords.forEach( k => this.add(k, nodeId) );
    }

    lookupNodesFromSubstring(str) {
        // find keys of keyword2nodes that match str as a pattern
        // build a new set of all values of matching keys
        let match_keys = Object.keys(this.keyword2nodes).filter(kw => this._escapedRegExp(str).test(kw));
        let matched_vals = match_keys.map(mk => this.keyword2nodes[mk]);
        //console.log('matching keys=', match_keys, 'vals=', matched_vals);

        //return this.keyword2nodes.filter(kw => new RegExp(str, 'i').test(kw)) || new Set([]);
        return matched_vals.reduce((a,b) => SetUnion(a,b), new Set([]));
    }

    _escapedRegExp(string) {
          return RegExp(string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); // $& means the whole matched string
    }

    lookupNodesFromKeyword(keyword) {
        return this.keyword2nodes[keyword] || new Set([]);
    }

    lookupNodesFromAnyKeywords(keywords) {
        let kwArr = Array.from(keywords);
        return kwArr.map(k => this.lookupNodesFromSubstring(k)).reduce((a, b) => SetUnion(a, b), new Set([]));
        //return kwArr.map(k => this.lookupNodesFromKeyword(k)).reduce((a, b) => SetUnion(a, b), new Set([]));
    }

    lookupNodesFromAllKeywords(keywords) {
        let kwArr = Array.from(keywords);
        return kwArr.map(k => this.lookupNodesFromSubstring(k)).reduce((a, b) => SetIntersection(a, b));
        //return kwArr.map(k => this.lookupNodesFromKeyword(k)).reduce((a, b) => SetIntersection(a, b));
    }

    lookupKeywordsFromNode(nodeId) {
        return this.node2keywords[nodeId] || [];
    }

    getPossibleKeywords(forNodes = null) {
        if (forNodes === null) {
            return this.possibleKeywords;
        }
        let visibleKeywords = forNodes.map(fn => this.node2keywords[fn]);
        let visSet = new Set();
        visibleKeywords.forEach(el => {
            el.forEach(elKw => visSet.add(elKw));
        });
        return visSet;
    }
}
