//import $ from 'jquery';
import lowerCase from 'lodash.lowercase';
import { View } from './View';
import { Action, ActionTypes } from './Action';
import { API_URL_BASE } from './config';
import { Alpaca } from './Alpaca';
import Snackbar from 'node-snackbar';
import { SchemaUtils } from './GraphUtils';
import { MessageBar } from './MessageBar';
import { KeywordIndex } from './KeywordIndex';
import { applyFilterRules, DEFAULT_FILTER_RULES } from './FilterRules';

import 'jquery-ui';
import 'jquery-ui/themes/base/all.css';
import 'jquery-ui/ui/widgets/autocomplete';
import 'jquery-ui/themes/base/autocomplete.css';

let tokenfield = require('imports-loader?define=>false!bootstrap-tokenfield')($);

//import 'select2/dist/js/select2.full';
//import 'select2/dist/css/select2.css';

export class GraphSearchSidebarView extends View {

    constructor(container, graphService, userScope, messageBar, visibilityService) {
        super(container);
        //console.log('my $ is', $);

        this.userScope = userScope;
        this.messageBar = messageBar;

        this.graphService = graphService;
        this.visibilityService = visibilityService;

        this.state = {};
        this.kwSet = new Set();

        Action.on(ActionTypes.SELECT_INSTANCES, (e, data) => {
            var selectedInstanceNodes = data.nodes.map( id => this.graphService.instance.$id(id) ).filter(o => o.length > 0);
            // update the number of matches field
            if(data.fromSearch) {
                this.showSearchInfo(`Showing ${selectedInstanceNodes.length} matching results`);
            }
            // zoom to fit on the matching nodes (?)
    //            app.views.instanceGraph.cy.fit(data.nodes.map(id=>'#'+id).join(', '));
        });

        // Action.on(ActionTypes.SELECT_NONE, (e, data) => {
        //     this.showSearchInfoPlaceholder();
        //     // zoom to fit on the matching nodes (?)
        //     app.views.instanceGraph.cy.fit();
        // });

        this.graphService.onInstanceUpdate((graphService) => {
            this.reRender();
        });

        this.visibilityService.registerClearCallback(() => {
            if (this.searchTokenField) {
                this.searchTokenField.tokenfield('setTokens', []);
            }
        });

        this.visibilityService.registerCallback(() => {
            this._buildKeywordCache();
        });

        this.reRender();
    }

    showSearchInfo(what) {
        $('div.searchinfo').html(what);
    }

    placeholderText() {
        return "When the Match All option is selected, matches must have all specified keywords, otherwise any matches with one or more of the keywords will be found.";
    }

    showSearchInfoPlaceholder() {
        this.showSearchInfo( this.placeholderText() );
    }

    // extractInstanceSearchStrings(nodelist) {
    //     let kwords = nodelist
    //         .map(n => n.data())
    //         .filter(nd => nd.props !== undefined && nd.props.keywords !== undefined)
    //         .map(nd => nd.props.keywords)
    //         .reduce((kwds, nkwds) => kws.concat(nkwds), []);

    //     let nodenamesKeywordsLists = _.compact(nodelist.filter(n => n.data().props).map(n => n.data().props.name)).map(nname => lowerCase(nname).split(/\s+/));
    //     let nodeNamesKeywords = _.uniq( Array.prototype.concat.apply([], nodenamesKeywordsLists).sort() );
    //     console.log('search nodelist', nodelist, 'kwords', kwords, 'nodenames', nodeNamesKeywords);
    //     let ret = [].concat(kwords, nodeNamesKeywords);
    //     this.possibleKeywords = ret;
    //     return ret;
    // }

    reRender() {
        this.show( this.render() );
    }

    renderMessage(msg) {
        return $('<div>').html(msg);
    }

    _buildKeywordCache() {
        let keywordIndex = this.graphService.getKeywordIndex();
        let visNodes = this.visibilityService.getCytoQuery().getNodeSet();
        if (visNodes.size == 0) {
            this.keywordCache = Array.from(keywordIndex.getPossibleKeywords());
        } else {
            this.keywordCache = Array.from(keywordIndex.getPossibleKeywords(Array.from(visNodes)));
        }
        console.log('vis nodes=%O, avail kws=%O', visNodes, this.keywordCache);
    }

    render() {
        console.warn('Search ReRender');

        let searchfield = $( '<input class="form-control" type="text" placeholder="Search" />');
        let searchallcb = $('<input type="checkbox">');
        let searchinfo = $('<div>').addClass('searchinfo').text( this.placeholderText() );

        let ctr = $('<div>').append(searchfield);

        this._buildKeywordCache();

        let keywordSourceFn = (req, resp) => {
          
            console.log('autocomplete, search=%O, currnetTokens=%O', req.term, this.kwSet);

            let candidates = this.keywordCache.filter(kw => !this.kwSet.has(kw));
            candidates = candidates.filter(kw => kw.includes(req.term.toLowerCase()));
            candidates = candidates.slice(0, 8);
            //console.log('candidates (pre-sort)=', candidates);
            candidates.sort((a,b) => {
                if (a == req.term) {
                    return -1;
                } else if (b == req.term) {
                    return 1;
                } else {
                    return a.localeCompare(b);
                }
            });
            // console.log('candidates (post-sort)=', candidates);
            //let candobjs = candidates.map(cand => ({label: cand.toUpperCase(), value: cand}));
            //resp(candobjs);
            
            resp(candidates);
            //return candidates;
        };

        var tfopts = {
            autocomplete: {
                source: keywordSourceFn,
                delay: 100
            },
            showAutocompleteOnFocus: true
        };
        if (this.searchTokenField) {
            $(this.searchTokenField).tokenfield('destroy');
        }
        this.searchTokenField = $(searchfield).tokenfield(tfopts);
        this.searchTokenField.on('tokenfield:createtoken', function (e) {
            var tokens = $(searchfield).tokenfield('getTokens');
            var thisTokenValue = e.attrs.value;
            let cands = [];


            // keywordSourceFn({term: thisTokenValue}, (cc) => { cands = [...cc]; } );
            // console.log('candidates=', cands);
            // if (!cands.includes(thisTokenValue)) {
            //     console.log('token not in valid entries, falling back');
            //     if (cands.length > 0) {
            //         console.log('changing selected token for best cnadidate=', cands[0]);
            //         e.attrs.value = e.attrs.label = cands[0];
            //         //console.log(e);
            //     } else {
            //         e.preventDefault();
            //         return false;
            //     }
            // }

            if(tokens.find( (t) => t.value === thisTokenValue ) !== undefined) {
                // don't allow it to be created if a token with the same value already exists
                console.log('token exists, cancelling');
                e.preventDefault();
                return false;
            }
            return true;
        });

        let onChangeFn = (e) => {

            let searchKeywords = $(searchfield).tokenfield('getTokens').map(t => t.value);
            console.log('GraphSearchSidebarView new search keywords:', searchKeywords);
            this.kwSet = new Set(searchKeywords);
            this.visibilityService.setIncludeKeywords(searchKeywords);
        };

        this.searchTokenField.on('tokenfield:createdtoken', onChangeFn);
        this.searchTokenField.on('tokenfield:editedtoken',  onChangeFn);
        this.searchTokenField.on('tokenfield:removedtoken', onChangeFn);

        return $('<div>').append(
            $('<div>').addClass('searchbox')
                .append(ctr)
                // .append($('<span>').append(searchallcb, '<label>Match All</label>'))
                // .append(searchinfo)
        );

    }
}
