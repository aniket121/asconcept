import $ from 'jquery';
import _ from 'lodash';
import Snackbar from 'node-snackbar';
import 'node-snackbar/dist/snackbar.css';

export class MessageBar {
    constructor(app) {
        this.app = app;
        this.default_snack_attrs = {
            width: '90%',
            pos: 'top-center',
        }
    }

    _info(message, props) {
        let props_copy = Object.assign({}, props);
        _.defaults(props_copy, this.default_snack_attrs);
        props_copy.text = message;
        Snackbar.show(props_copy);
    }
    info(msg) {
        this._info(msg, {});
    }
    error(msg) {
        this._info('<i class="fa fa-exclamation-triangle fa-2x" style="color: red;" aria-hidden="true"></i> ' + msg);
    }
    message(msg) {
        return this._info(msg, {});
    }
};
