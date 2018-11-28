import { View } from './View';

export class CountBar extends View {

    constructor(container, graphService, visibilityService) {
        super(container);
        this.visibilityService = visibilityService;
        this.graphService = graphService;

        this.visibilityService.registerCallback( () => this.onUpdate() );
    }

    onUpdate() {
        let totalNodes = this.graphService.instance.nodes().length;
        let shownNodes = this.visibilityService.getCytoQuery().getNodeSet().size;
        let showing = `<b>Showing:</b> ${shownNodes}</b> of ${totalNodes} Nodes`;

        let pinnedCount = this.visibilityService.getRules().includeManual.size;
        let pinned = ` <b>Pinned:</b> ${pinnedCount}`;

        let expandedCount = this.visibilityService.getRules().includeManualAndExpand.size;
        let expanded = ` <b>Expanded</b>: ${expandedCount}`;

        let html =  '' + showing + ((pinnedCount > 0)? pinned : '') + ((expandedCount > 0)? expanded : '');

        $( this.getContainer() ).html(html);
    }

}
