// load jquery into window.$ for everything else to use.
//global.$ = require("jquery");
//import $ from 'jquery';
//global.$ = require('jquery');
import cytoscape from "cytoscape";
import cxtmenu from 'cytoscape-cxtmenu';
import 'bootstrap';

import 'cytoscape-cxtmenu/font-awesome-4.0.3/css/font-awesome.min.css';
import panzoom from 'cytoscape-panzoom';
import 'cytoscape-panzoom/cytoscape.js-panzoom.css';
//import alpaca from "alpaca";
//import alpaca from 'alpaca';
//global.$.fn.alpaca = alpaca;
import { App } from './App';
import { UserRole } from './UserRole';

//import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import '../public/logo-cropped-red.png';

import './App.less';
//import 'jquery-ui/ui/widgets/autocomplete';
//import alpaca from 'alpaca';

//require('alpaca');
//require('bootstrap-tokenfield');

//$.widget("", {}); // jquery-ui test
// Hai!


// Thanks https://gist.github.com/itslenny/f55727d00586de6f2f086d5147357ab4
Set.prototype.isEqual = function(otherSet) {
    if(this.size !== otherSet.size) return false;
    for(let item of this) if(!otherSet.has(item)) return false;
    return true;
};

let loadapp = () => {
    try {
        cytoscape.use(cxtmenu);
        cytoscape.use(panzoom);


        global.role = new UserRole();
        role.getUserInfo().then((r) => {
            console.log('constructing App with UserRole=', r);
            $('#userinfo').text(r.getUser());
            let app = global.app = new App(r);
        });
        // fetch('/api/auth', {mode: 'cors', credentials: 'include' })
        //     .then((data) => { return data.json(); })
        //     .then((json) => {
        //         let appcreds = json;
        //         if (appcreds.username && appcreds.username.split('-').length == 2) {
        //             let [username, usergroup] = appcreds.username.split('-');

        //             appcreds.username = username;
        //             appcreds.usergroup = usergroup;
        //             console.log('setting creds to split u/g: ', appcreds);
        //         }

        //         global._creds = appcreds;

        //         global.app = new App(appcreds.usergroup);
        //         return { app: global.app, creds: global._creds };
        //     })
        //     .catch((err) => {
        //         console.err('err in auth or app setup: ', err);
        //         global._creds = { 'username': 'unknown', 'usergroup': 'viewer' };
        //         global.app = new App(global._creds.usergroup);
        //         return { app: global.app, creds: global._creds };
        //     })
        //     .then((appinst) => {
        //         $('#userinfo').text(appinst.creds.username);
        //         console.log('created app instance, app=', appinst.app, ' creds=', appinst.creds);
        //     });
        // // global.cytoscape = cytoscape;

        // window.hmr = module.hot;

        // if (module.hot) {
        //     module.hot.accept('./App', function() {
        //         console.log('update?', this);
        //     })
        // }


        // if (module.hot) {
        //     module.hot.decline();
        // }
        // if (module.hot) {
        //     module.hot.accept('./App.js', function() {
        //         alert('update waiting...');
        //         window.location.reload(true);
        //         console.log('index accepting hot updates for App.js');
        //     });
        //     // module.hot.accept('./AppTemplate.html', function() {
        //     //     window.navigation.reload();
        //     //     console.log('*** change to template forcing refresh');
        //     // });

        //     module.hot.dispose(data => {
        //         console.log('index.js being disposed, data=', data, this); })
        // }

        $(function () {
           
            $('[data-toggle="popover"]').popover();
            $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover', container: 'body' });
            $(document).on('visibilitychange', ev => {
                let visState = ev.target.visibilityState === 'visible';
                if (!visState) {
                    console.log('lost focus, cleaning up tooltips');
                    $('[data-toggle="tooltip"]').tooltip('hide');
                }
            });
        });
    } catch (err) {
        // console.log("caught a thing!", err);
       // Source mapping doesn't work unless actually thrown
        throw err;
    }

};

global.loadapp = loadapp;
//global.userrole = UserRole;

loadapp();
