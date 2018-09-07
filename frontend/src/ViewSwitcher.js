import $ from "jquery";

export class ViewSwitcher {
    constructor(hiddenClass, shownClass, views) {
        this.hiddenClass = hiddenClass
        this.shownClass = shownClass
        this.currentView = undefined;
    }

    showView(view) {
        // hide previous View
        if(typeof this.currentView !== "undefined") {
            var cur = $(this.currentView.getContainer());
            cur.removeClass(this.shownClass);
            cur.addClass(this.hiddenClass);
        }

        // show new one
        this.currentView = view;

        var ele = $(view.getContainer());
        ele.removeClass(this.hiddenClass);
        ele.addClass(this.shownClass);

        view.onDisplay();
    }
}
