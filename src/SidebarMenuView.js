import { View } from './View';

class SidebarMenuView extends View {
    constructor(container) {
        super(container);

        this.showSchemaButton = $('<button/>', {
            text: "Show Schema",
            click: () => {

            },
        });

        this.showTopicsButton = $('<button/>', {
            text: "Show Topics",
            click: () => {

            },
        });
        this.reloadDataButton = $('<button/>', {
            text: "Reload Data",
            click: () => {

            },
        });
    }
}
