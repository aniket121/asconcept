import cytoscape from "cytoscape";

import { GraphService, MockGraphService } from './GraphService';
import { UploadService, MockUploadService } from './UploadService';
import { Action, ActionTypes } from './Action';
import { ViewSwitcher } from './ViewSwitcher';
import { InstanceView } from './InstanceView';
import { NodeSchemaView } from './NodeSchemaView';
import { TopicView } from './TopicView';
import { GraphFilterSidebarView } from './GraphFilterSidebarView';
import { TopicFilterSidebarView } from './TopicFilterSidebarView';
import { GraphEditorSidebarView } from './GraphEditorSidebarView';
import { GraphInfoSidebarView } from './GraphInfoSidebarView';
import { GraphSearchSidebarView } from './GraphSearchSidebarView';
import { FilterInfoSidebarView } from './FilterInfoSidebarView';
import { PlaybookView } from './PlaybookView';
import { Hoverbar } from './Hoverbar';
import { CountBar } from './CountBar';
import { MessageBar } from './MessageBar';
import { VisibilityService, DEFAULT_VIEWER_RULES, DEFAULT_RULES } from './VisibilityService';
import { UrlService } from './UrlService';
import { API_URL_BASE, UPLOAD_URL_BASE } from './config';
import { GraphView } from './GraphView';
import { TestView } from './testView';
import mousetrap from 'mousetrap';

import Snackbar from 'node-snackbar';
import  'node-snackbar/dist/snackbar.css';

import Tokenfield from 'bootstrap-tokenfield';
import 'bootstrap-tokenfield/dist/css/bootstrap-tokenfield.css';

import {tools} from './GraphTools';
//import querystring from 'querystring';
const querystring = require('expose-loader?querystring!querystring');

window.$ = $;
global.jq = $;
global.Action = Action;
//global.console = window.cons;

//window.$ = $;

window.SB = Snackbar;
window.$tokenfield =  Tokenfield;

//tokenfield(window);

function mkDiv(id) {
    $('#'+id).remove();
    return $('<div/>').appendTo('body').addClass('hidden').attr('id', id).get(0);
}

export class App {
    constructor(userAuth) {
        console.log(userAuth)
        // if (module.hot) {
        //     module.hot.accept('./GraphInfoSidebarView', () => {
        //         let GraphInfoSidebarView = require('./GraphInfoSidebarView');
        //         this.views.sideBarInfo = new GraphInfoSidebarView( document.getElementById('sidebar-info') );
        //     });
        //     module.hot.dispose(data => {
        //         console.log('being disposed, data=', data); })
        // }
        //

        this.userAuth = userAuth;

        this.urlService = new UrlService({'userAuth': this.userAuth});
        this.urlService.handleUrlHash(window.location.hash, UrlService.PRE_SETUP, undefined, undefined);
        console.log('App this.urlService.getSettings():', this.urlService.getSettings());

        this.userScope = this.urlService.getSettings().userMode;

        console.error('user scope =', this.userScope);
        this.messageBar = new MessageBar(this);

        this._setupGraphService();
        this._setupViewSwitcher();

        let visRulesMap = {
            viewer: DEFAULT_VIEWER_RULES,
            editor: DEFAULT_RULES,
            admin: DEFAULT_RULES
        };
        let userVisRules = visRulesMap[this.userScope];
        console.log('user %O using default vis rules %O', this.userScope, userVisRules);
        this.visibilityService = new VisibilityService(this.graphService, userVisRules);

        this.tools = tools;

        this.views = {
            // graphs
           
            instanceGraph: new InstanceView( mkDiv('graph-instance'), this.graphService, this.visibilityService, this.urlService),
            nodeSchemaGraph: new NodeSchemaView( mkDiv('graph-nodeschema'), this.graphService ),
            topics: new TopicView( mkDiv('graph-topics'), this.graphService ),
            playbook: new PlaybookView( mkDiv('playbookview'), this.graphService ,this.visibilityService),

            //testview
            testView:new TestView( mkDiv('testview') ),
            
            // sidebar
            sidebarFilter: new GraphFilterSidebarView( document.getElementById('sidebar-filter'), this.graphService, this.visibilityService ),
            sidebarTopicFilter: new TopicFilterSidebarView( document.getElementById('sidebar-topic-filter'), this.graphService, this.visibilityService ),
            sidebarEditor: new GraphEditorSidebarView( document.getElementById('sidebar-form'), this.graphService, this.uploadService, this.userScope, this.messageBar ),
            sidebarInfo: new GraphInfoSidebarView( document.getElementById('sidebar-info'), this.graphService, this.userScope, this.messageBar, this.urlService ),
            sidebarSearch: new GraphSearchSidebarView(document.getElementById('sidebar-search'), this.graphService, this.userScope, this.messageBar, this.visibilityService ),
            sidebarFilterInfo: new FilterInfoSidebarView(document.getElementById('sidebar-filter-info'), this.visibilityService),

            // hoverbar
            hoverbar: new Hoverbar( document.getElementById('hoverbar') ),
            countbar: new CountBar(document.getElementById('countbar'), this.graphService, this.visibilityService),
        };

        //Snackbar.show({text: 'Example notification text.'});
        this.lhsViewSwitcher.showView( this.views.instanceGraph );
        this.rhsViewSwitcher.showView( this.views.nodeSchemaGraph );

        this.sidebarViewSwitcher.showView( this.views.sidebarEditor );

        Action.on(ActionTypes.SELECT_PLAYBOOK, (e, data) => {
            this.rhsViewSwitcher.showView( this.views.playbook );
        });

        Action.on(ActionTypes.PLAYBOOK_CLOSE, (e, data) => {
            this.rhsViewSwitcher.showView( this.views.nodeSchemaGraph );
        });

        mousetrap.bind('shift+f', (ev) => {
            console.log('binding triggered', ev);
            console.log('active view=', this.getActiveView());
            if (this.getActiveView() instanceof GraphView) {
                this.getActiveView().cy.fit();
            }
        }, 'keypress');
        mousetrap.bind('shift+i', (ev) => {
            console.log('s-i binding triggered', ev);
            if (this.getActiveView() === this.views.instanceGraph) {
                this.scrollSidebar($('#sidebar-info'));
            }
        }, 'keypress');

        $('#rhs-view-controls').on('click', 'label, input', (ev) => {
            let $l = $(ev.target);
            let newRHSView = $l.data('rhs-view');
            
            switch (newRHSView) {

            case "schema":
                this.rhsViewSwitcher.showView( this.views.nodeSchemaGraph );
                Action.trigger(ActionTypes.SHOW_SCHEMA, {});
                break;
            case "topics":

                this.rhsViewSwitcher.showView( this.views.topics );
                Action.trigger(ActionTypes.SHOW_SCHEMA, {});
                break;
            case "playbook":
                this.rhsViewSwitcher.showView( this.views.playbook );
                Action.trigger(ActionTypes.SHOW_PLAYBOOK, {});
                break;

            }
            //console.log(ev, ev.target, ev.currentTarget);
            //_.defer(() => { $(ev.currentTarget).blur(); }); // deselect it afterwards.
            //console.log($l.data('rhs-view'));
        });

        $('#btn-reload').click(() => {
            Action.trigger(ActionTypes.SELECT_NONE, {});
            this._loadData();
        }).tooltip({ 'title': 'Refresh the graph to the most recent version, to include any changes recently made by others..', 'placement': 'auto' });

        $('#btn-clear-inst').click((ev) => {
            this.visibilityService.resetAll();
            $(ev.currentTarget).blur();
        });

        $('input:text#current-state-url').focus(function() { $(this).select(); } );

        // $('#btn-init-layout').click((ev) => {
        //     window.app.views.instanceGraph.onInitialLayout();
        // });
        // $('#btn-re-layout').click((ev) => {
        //     window.app.views.instanceGraph.onRelayout();
        // });
        
        let preserveSettingsFn = () => {
            return $('#chk-su-preserve-state').prop('checked');
        };
        let suAdminButton = $('#btn-switchuser-admin');
        let suViewerButton = $('#btn-switchuser-viewer');

        suAdminButton.click(() => this.urlService.setUserMode('admin', preserveSettingsFn()));
        // $('#btn-switchuser-editor').click(() => this.urlService.setUserMode('editor', preserveSettingsFn()));
        suViewerButton.click(() => this.urlService.setUserMode('viewer', preserveSettingsFn()));
        
        switch (this.userScope) {
        case 'viewer':
            suViewerButton.attr('disabled', true);
            break;
        case 'editor':
            break;
        case 'admin':
            suAdminButton.attr('disabled', true);
            break;
        }

        if(Array.from(this.userAuth.getAvailableRoles()).length > 1) {
            $('#user-mode-switcher').show();
        }

        $('body').on('click', '.class-link', (ev) => {
            let $target = $(ev.target);
            ev.preventDefault();
            console.log('class-link clicked', ev.target, ev);
            if ($target && $target.data()) {
                let class_name = $target.data('class');
                console.log('selecting schema class', class_name);
                let clscoll = this.views.nodeSchemaGraph.cy.nodes(`node[name='${class_name}']`);
                if (clscoll.length) {
                    console.log('cls elem=', clscoll[0]);
                    Action.trigger(ActionTypes.SELECT_CLASS, { class_name: class_name,
                                                               class_node:  clscoll[0]});
                }
            }
        });
        $('#scopeinfo').text(this.userScope);
        this._loadData();

        $(window).on('hashchange', (e) => {
            // let oldUrl = e.originalEvent.oldURL, newUrl = e.originalEvent.newURL;
            // let oldFrag = oldUrl.replace(/^.*?#(.*)$/, '$1');
            // let newFrag = newUrl.replace(/^.*?#(.*)$/, '$1');
            // console.warn('page location hash-fragment changed old=', oldFrag, ' new=', newFrag);
            // if (oldFrag !== newFrag && newFrag.length > 0) {
            //     this._setupGraphService();
            //     // TODO: should this (and maybe the btn-reload) just call trigger(RELOAD_DATA)?
            //     this._loadSchemaData();
            //     this._loadInstanceData();
            // }

            this.urlService.handleUrlHash(window.location.hash, UrlService.ON_URLCHANGE, this.graphService, this.visibilityService);
        });

        this.urlService.handleUrlHash(window.location.hash, UrlService.POST_SETUP, this.graphService, this.visibilityService);
    }

    scrollSidebar(toObj) {
        let $sbar = $('div.sidebar');
        $sbar.scrollTop($(toObj).offset().top - $sbar.offset().top + $sbar.scrollTop());
    }

    getActiveView() {
        let lastActives = Object.entries(this.views).map(([k,v]) => [k, v.getLastActive()]);
        lastActives.sort((a,b) => b[1] - a[1]);
        return this.views[lastActives[0][0]];
    }

    _setupGraphService() {
        let hashValues = this.urlService.getSettings();
        console.log('URL hashValues=', hashValues);

        if("mock" in hashValues || "mockInstanceGraph" in hashValues || "mockSchemaGraph" in hashValues) {
           
            if(!("mockInstanceGraph" in hashValues)) { hashValues["mockInstanceGraph"] = API_URL_BASE+"/graph"; }
            if(!("mockSchemaGraph"   in hashValues)) { hashValues["mockSchemaGraph"]   = API_URL_BASE+"/schema/graph"; }

            let instanceUrl = hashValues.mockInstanceGraph;
            let schemaUrl   = hashValues.mockSchemaGraph;
            console.log('Using Mock GraphService instanceUrl=', instanceUrl, ' schemaUrl=', schemaUrl);
            this.graphService = new MockGraphService(instanceUrl, schemaUrl);
            this.uploadService = new MockUploadService("");
            $('#mock-info').html($('<a>').attr('href', instanceUrl).text('Using Mocked Instance')).removeClass('hidden').show();
        } else {
            
            this.graphService = new GraphService();
            this.uploadService = new UploadService();
            $('#mock-info').hide();
        }

        Action.on(ActionTypes.RELOAD_DATA, (e, data) => {

            this._loadData(data);
        });
    }

    _loadData(data) {
       
        this.graphService.loadSchemaGraph((cy) => {
            Action.trigger(ActionTypes.LOADED_SCHEMA_GRAPH, { cy: cy });
            this.graphService.loadInstanceGraph((cy) => {
                
                if(!this.doneFirstLoad) {
                    console.log("START onFirstLoad()");

                    this.urlService.handleUrlHash(window.location.hash, UrlService.PRE_LOADED, this.graphService, this.visibilityService);

                    Action.trigger(ActionTypes.LOADED_INSTANCE_GRAPH, { cy: cy, reload_data: data });

                    this.urlService.handleUrlHash(window.location.hash, UrlService.POST_LOADED, this.graphService, this.visibilityService);
                    this.doneFirstLoad = true;
                    console.log("END onFirstLoad");
                } else {
                    Action.trigger(ActionTypes.LOADED_INSTANCE_GRAPH, { cy: cy, reload_data: data });
                   
                }
            });

        });

    }

    _loadSchemaData() {
        this._loadData();
    }

    _loadInstanceData(data) {

        this._loadData(data);
    }

    _setupViewSwitcher() {
        

         if(localStorage.getItem("mattersmith")){
        this.lhsViewSwitcher = new ViewSwitcher('hidden', 'lhsgraph');
        this.rhsViewSwitcher = new ViewSwitcher('hidden', 'rhsgraph');
        this.sidebarViewSwitcher = new ViewSwitcher('hidden', null);
        }
    }

    _resetDisplays() {
        this.lhsViewSwitcher.currentView.onDisplay();
        this.rhsViewSwitcher.currentView.onDisplay();
        this.sidebarViewSwitcher.currentView.onDisplay();
    }
};
