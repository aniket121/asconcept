import { View } from './View';

export class FilterInfoSidebarView extends View {

    constructor(container, visibilityService) {
        super(container);

        this.visibilityService = visibilityService;
        this.visibilityService.registerCallback(() => {
            this.reRender();
        });
    }

    render() {
        let rules = this.visibilityService.getRules();
        let query = this.visibilityService.getCytoQuery();
        let expand = rules.includeManualAndExpand;
        let manual = rules.includeManual;
        let total = query.getNodeSet().size;
        let nonManual = total - manual.size - expand.size;

        return $('<div>').append(
            $('<div class="btn-group btn-group-justified btn-group-sm">').append(
                $('<div class="btn-group btn-group-sm">').append(
                    $('<button class="btn btn-default btn-sm" type="button">')
                        .text('Collapse ')
                        .attr("disabled", (expand && expand.size) > 0 ? false : true)
                        .click(() => { this.visibilityService.resetExpandedNodes(); })
                        .append(
                            $('<span class="badge">').text(expand.size),
                        ).tooltip({
                            'title': 'Hide all nodes and their neighbors that were manually expanded but no longer included by the other filters.',
                        })
                ),
                $('<div class="btn-group btn-group-sm">').append(
                    $('<button class="btn btn-default btn-sm" type="button">')
                        .text('Unpin ')
                        .attr("disabled", (manual && manual.size) > 0 ? false : true)
                        .click(() => { this.visibilityService.resetIncludeManual(); })
                        .append(
                            $('<span class="badge">').text(manual.size),
                        ).tooltip({
                            'title': 'Hide all nodes that were manually pinned but no longer included by the other filters.',
                        })
                ),
                $('<div class="btn-group btn-group-sm">').append(
                    $('<button class="btn btn-default btn-sm" type="button">')
                        .text('Reset ')
                        .attr('disabled', (nonManual > 0)? false : true)
                        .click(() => {
                            this.visibilityService.resetFilters();
                        }).append( $('<span class="badge">').text(nonManual) )
                        .tooltip({
                            'title': 'Reset filters so that only pinned and expanded nodes are shown.',
                        })
                ),
                // $('<div class="btn-group">').append(
                //     $('<button class="btn btn-warning" type="button">')
                //         .text('All')
                //         .attr('disabled', (total > 0)? false : true)
                //         .click(() => {
                //             this.visibilityService.resetAll();
                //         }).append( $('<span class="badge">') )
                //         .tooltip({
                //             'title': 'Reset all filters to start again from an empty graph.',
                //         }),
                // ),
            )
        );
    }

    onLoadInstanceGraph() {
        this.reRender();
    }

}
