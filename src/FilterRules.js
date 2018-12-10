// Filter rules
// Example:
// rules = {
//     excludeNodeClasses: ['Topic'],
//     excludeRelationClasses: ['HasTopic'],
// }
//
// Excluding nodes automatically excludes the edges connected to them too.

export const DEFAULT_FILTER_RULES = {
    excludeNodeClasses: ['Topic'],
    excludeRelationClasses: [],
};

export function applyFilterRules(rules, allcy, cy) {
    var somethingChanged = false;
    allcy.nodes().forEach( (ele) => {
        if(cy.$id(ele.id()).length > 0) {
            // node exists - should it?
            if(rules.excludeNodeClasses.includes(ele.data().cls)) {
                // don't keep
                cy.remove('#' + ele.id());
                somethingChanged = true;
            } else {
                // keep
            }

        } else {
            // node doesn't exist - should it?
            if(rules.excludeNodeClasses.includes(ele.data().cls)) {
                // don't add
            } else {
                // add
                cy.add(ele);
                somethingChanged = true;
            }
        }
    });

    allcy.edges().forEach( (ele) => {
        if(cy.$id(ele.id()).length > 0) {
            // edge exists - should it?
            if(rules.excludeRelationClasses.includes(ele.data().cls)) {
                // don't keep
                cy.remove('#' + ele.id());
                somethingChanged = true;
            } else {
                // keep
            }

        } else {
            // edge doesn't exist - should it?
            if(rules.excludeRelationClasses.includes(ele.data().cls)) {
                // don't add
            } else {
                // add, if both end nodes exist
                if(
                    (cy.$id( ele.source().id() ).length > 0) &&
                    (cy.$id( ele.target().id() ).length > 0)
                ) {
                    cy.add(ele);
                    somethingChanged = true;
                }
            }
        }
    });
    return somethingChanged;
}


