import { Action, ActionTypes } from './Action';

// Thanks https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
function parseQuery(queryString) {
    
    var query = {};
    var pairs = (queryString[0] === '#' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

export class UrlService {

    // update causes (becasue ES6 can't do static class constants)   // Note: graphService and visibilityService aren't avalaible in PRE_SETUP
    static get PRE_SETUP()    { return "UrlService.PRE_SETUP"; }     // -> right at the start of App constructor, before anything has loaded (No graph data)
    static get POST_SETUP()   { return "UrlService.POST_SETUP"; }    // -> once the App is constructed, but before the graphs have loaded
    static get PRE_LOADED()   { return "UrlService.PRE_LOADED"; }    // -> once after the instance graph has loaded for the first time, but no init
    static get POST_LOADED()  { return "UrlService.POST_LOADED"; }   // -> after the first LOADED_INSTANCE_DATA
    static get ON_URLCHANGE() { return "UrlService.ON_URLCHANGE"; }  // -> whenever the hash part of the url is changed by the user

    constructor(initial = {}) {
        this.data = undefined;
        this.settings = Object.assign({}, initial);

        if(this.settings.userAuth) {
            this.settings.userMode = this.settings.userAuth.getRole();
        }

        this.donePreSetup = false;
        this.donePostSetup = false;
        this.donePreLoaded = false;
        this.donePostLoaded = false;
        this.ignoreNextChange = false;

        console.log('initial settings=', this.settings);
    }

    clearSettings() { this.settings = {}; }

    getSettings() { return this.settings; }

    clearHash() {
        if(window.location.hash != '') {
            this.ignoreNextChange = true;
            window.location.hash = '';
        }
    }

    setUserMode(userMode, preserveSettings = true) {
        if(!new Set(this.settings.userAuth.getAvailableRoles()).has(userMode)) {
            return false;
        }

        if (!preserveSettings) {
            this.clearSettings();
        }

        this.settings.userMode = userMode;
        this.updateUrl(true, true);
        window.location.reload();
        return true;
    }

    handleUrlHash(urlHash, cause, graphService, visibilityService) {
        if(this.ignoreNextChange) {
            console.log('UrlService.handleUrlHash IGNORING urlHash=', urlHash);
            this.ignoreNextChange = true;
            return;
        }

        if(cause === UrlService.ON_URLCHANGE && !this.donePostLoaded) {
            console.log('UrlService.handleUrlHash IGNORING ON_CHANGEURL before finished loading');
            return;
        }


        let data = parseQuery(urlHash);
        
        console.log('UrlService.handleUrlHash cause=', cause, 'urlHash=', urlHash, 'data=', data);

        if(cause === undefined || cause === null) {
            console.error('UrlService.handleUrlHash called without a cause!');
        }

        this.data = data;
        this.graphService = graphService;
        this.visibilityService = visibilityService;

        if(!data.v) {
            data.v = "1";
        }

        if(data.v === "1") {
            this._handleV1(data, cause);
        } else {
            console.warn('UrlService.handleUrlHash unknown url version v=', data.v);
        }

        if(cause === UrlService.PRE_SETUP) {
            this.donePreSetup = true;
        } else if(cause === UrlService.POST_SETUP) {
            this.donePostSetup = true;
        } else if(cause === UrlService.PRE_LOADED) {
            this.donePreLoaded = true;
        } else if(cause === UrlService.POST_LOADED) {
            this.donePostLoaded = true;
            this.clearHash();
        } else if(cause === UrlService.ON_URLCHANGE) {
            this.clearHash();
        }
    }

    _handleV1(data, cause) {

        if(cause === UrlService.PRE_SETUP) {
            this._handleGraphMockingV1(data);
            this._handleUserModeV1(data);
        }

        if(cause === UrlService.PRE_LOADED) {
            this._handleFilterRulesV1(data, true);
        } else if(cause === UrlService.ON_URLCHANGE && this.donePostLoaded) {
            this._handleFilterRulesV1(data, false);
        }

        if(cause === UrlService.POST_LOADED || (cause === UrlService.ON_URLCHANGE && this.donePostLoaded)) {
            this._handlePlaybookOpenV1(data);
            this._handleInstanceSelectionV1(data);
        }
    }

    _handleFilterRulesV1(data, preloadOnly) {
        let filterRules = Object.assign({}, this.visibilityService.getEmptyRules());
        let setRules = false;

        if(data.filter_includeClasses !== undefined) {
            filterRules.includeClasses = data.filter_includeClasses.split(/\s*,\s*/);
            setRules = true;
        }

        if(data.filter_includeTopics !== undefined) {
            filterRules.includeTopics = data.filter_includeTopics.split(/\s*,\s*/);
            setRules = true;
        }

        if(data.filter_includeKeywords !== undefined) {
            filterRules.includeKeywords = data.filter_includeKeywords.split(/\s*,\s*/);
            setRules = true;
        }

        if(data.filter_expandNodes !== undefined) {
            let expandOids = data.filter_expandNodes.split(/\s*,\s*/);
            let expandIds = expandOids.map( oid => this.graphService.instance.nodes('[oid="' + oid + '"]').id() );
            filterRules.includeManualAndExpand = expandIds;
            setRules = true;
        }

        if(data.filter_includeManual !== undefined) {
            let manualOids = data.filter_includeManual.split(/\s*,\s*/);
            let manualIds = manualOids.map( oid => this.graphService.instance.nodes('[oid="' + oid + '"]').id() );
            filterRules.includeManual = manualIds;
            setRules = true;
        }

        if(!this._filterRules_hasSetupHandler) {
            this.visibilityService.registerCallback((newRules) => {
                this.settings.filterRules = newRules;
                this.updateUrl();
            });

            this._filterRules_hasSetupHandler = true;
        }

        if(setRules) {
            this.visibilityService.setRules(filterRules, {'preloadOnly': preloadOnly? true : false});
        }
    }

    _handlePlaybookOpenV1(data) {
        if(!this._playbook_hasSetupHandler) {

            Action.on(ActionTypes.SELECT_PLAYBOOK, (e, data) => {
                this.settings.playbook_isOpen = true;
                let node = this.graphService.instance.$id(data.node);
                this.settings.playbook_openOid = node.data().oid;
                this.updateUrl();
            });

            let closePlaybookFn = () => {
                this.settings.playbook_isOpen = false;
                this.updateUrl();
            };

            let openPlaybookFn = () => {
                this.settings.playbook_isOpen = true;
                this.updateUrl();
            };

            Action.on(ActionTypes.PLAYBOOK_CLOSE, closePlaybookFn);
            Action.on(ActionTypes.SHOW_SCHEMA, closePlaybookFn);
            Action.on(ActionTypes.SHOW_TOPICS, closePlaybookFn);

            Action.on(ActionTypes.SHOW_PLAYBOOK, openPlaybookFn);

            this._playbook_hasSetupHandler = true;
        }


        if(data.playbook_openOid) {
            let nodeId = this.graphService.instance.nodes().filter((n) => n.data().oid === data.playbook_openOid).id();
            Action.trigger(ActionTypes.SELECT_PLAYBOOK, { node: nodeId });
        }
    }

    _handleGraphMockingV1(data) {
        if(data.mock && (data.mockInstanceGraph || data.mockSchemaGraph)) {
            this.settings.mock = data.mock;

            if(data.mockInstanceGraph) { this.settings.mockInstanceGraph = data.mockInstanceGraph; }
            if(data.mockSchemaGraph)   { this.settings.mockSchemaGraph = data.mockSchemaGraph; }
        }
    }

    _handleUserModeV1(data) {
        if(!data.userMode) {
            this.settings.userMode = this.settings.userMode || "viewer";
        } else {
            if(new Set(this.settings.userAuth.getAvailableRoles()).has(data.userMode)) {
                this.settings.userMode = data.userMode;
            }
        }
    }

    _handleInstanceSelectionV1(data) {
        if(!this._instanceSelection_hasSetupHandler) {

            Action.on(ActionTypes.SELECT_INSTANCES, (e, data) => {
                if(data.nodes && data.nodes.length > 0) {
                    this.settings.selected_instanceNodes = Array.from(data.nodes).map(id => this.graphService.instance.$id(id).data().oid);
                } else {
                    this.settings.selected_instanceNodes = [];
                }
                this.updateUrl();
            });

            Action.on(ActionTypes.SELECT_NONE, (e, data) => {
                this.settings.selected_instanceNodes = [];
                this.updateUrl();
            });

            this._instanceSelection_hasSetupHandler = true;
        }

        if(data.select) {
            let selectedOids = data.select.split(/\s*,\s*/);
            let selectedIds = selectedOids.map( oid => this.graphService.getNodeByOid(oid).id() );

            Action.trigger(ActionTypes.SELECT_INSTANCES, { nodes: selectedIds });
        }
    }

    getUrlBase() {
        let l = window.location;
        return '' + l.protocol + '//' + l.host + l.pathname + l.search;
    }

    generateUrlHashFromSettings(settings, includeUserMode) {
        let obj = {};

        // playbook
        if(settings.playbook_isOpen && settings.playbook_openOid) {
            obj.playbook_openOid = settings.playbook_openOid;
        }

        // filter rules
        if(settings.filterRules) {
            let rules = settings.filterRules;

            if(rules.includeClasses && rules.includeClasses.size > 0) {
                obj.filter_includeClasses = Array.from(rules.includeClasses).join(',');
            }

            if(rules.includeTopics && rules.includeTopics.size > 0) {
                obj.filter_includeTopics = Array.from(rules.includeTopics).join(',');
            }

            if(rules.includeKeywords && rules.includeKeywords.size > 0) {
                obj.filter_includeKeywords = Array.from(rules.includeKeywords).join(',');
            }

            if(rules.includeManualAndExpand && rules.includeManualAndExpand.size > 0) {
                obj.filter_expandNodes = Array.from(rules.includeManualAndExpand).map(id => this.graphService.instance.$id(id).data().oid ).join(',');
            }

            if(rules.includeManual && rules.includeManual.size > 0) {
                obj.filter_includeManual = Array.from(rules.includeManual).map(id => this.graphService.instance.$id(id).data().oid).join(',');
            }
        }

        // selected nodes
        if(settings.selected_instanceNodes && settings.selected_instanceNodes.length > 0) {
            obj.select = Array.from(settings.selected_instanceNodes).join(',');
        }

        obj.v = '1'; // the current version

        if(includeUserMode && settings.userMode) {
            obj.userMode = settings.userMode;
        }

        // Encode for URI
        Object.keys(obj).forEach((k) => {
            obj[k] = encodeURIComponent(obj[k]);
        });

        //console.log('UrlService.generateUrlHashFromSettings: settings=', settings, 'obj=', obj);
        return '#' + Object.keys(obj).map(k => k.toString() + '=' + obj[k].toString()).join('&');
    }

    generateNodeUrlHash(nodeId) {
        let oid = this.graphService.instance.$id(nodeId).data().oid.toString();
        let settings = {
            "filterRules": {
                "includeManual": new Set([nodeId]),
            },
            "selected_instanceNodes": [oid],
        };
        return this.getUrlBase() + this.generateUrlHashFromSettings(settings);
    }

    generatePlaybookUrl(nodeId) {
        let oid = this.graphService.instance.$id(nodeId).data().oid.toString();
        let settings = {
            "filterRules": {
                "includeManual": new Set([nodeId]),
            },
            "playbook_isOpen": true,
            "playbook_openOid": oid,
            "selected_instanceNodes": [oid],
        };
        return this.getUrlBase() + this.generateUrlHashFromSettings(settings);
    }
   

    updateUrl(actuallyUpdate, includeUserMode) {
        let hash = this.generateUrlHashFromSettings(this.settings, includeUserMode);
        let url = this.getUrlBase() + hash;

        if(actuallyUpdate){
            console.warn('RELOADING TO URL', url);
            this.ignoreNextChange = true;
            window.location.replace(url);
        } else {
            $('#current-state-url').val(url);
        }
    }
}
