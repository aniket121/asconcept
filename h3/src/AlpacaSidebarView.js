import $ from "jquery";
import alpaca from "alpaca";
import { Action, ActionTypes } from "./Action";
import { View } from './View';

export class AlpacaSidebarView extends View {
    constructor(container) {
        super(container);
        this.form = undefined;
    }

    setForm(alpacadata) {
        this.form = alpacadata;

        var ele = $(this.getContainer());
        ele.empty();
        alpaca(ele, alpacadata);
    }

    onDisplay() {

    }

};

