// DEPRECATED - use graphservice instead

function setUnion(a, b) {
    return new Set([...a, ...b]);
}

export class SchemaUtils {
    constructor(graphService) {
        this.graphService = graphService;
    }

    getRelationClassImmediateParents(_relClassNode) {
        var relClass = this.graphService.schema.$id( _relClassNode.id() );
        var parentClasses = this.graphService.schema.collection([relClass]).outgoers("edge[label='REL_ISA']").targets();
        return parentClasses;
    }

    getRelationClassScopes(_relClassNode) {
        var relClass = this.graphService.schema.$id( _relClassNode.id() );
        var relScopes = new Set( relClass.data().props.scope );
        var parentClasses = this.getRelationClassImmediateParents(relClass);

        if(parentClasses.length > 1) {
            let parentScopes = parentClasses.reduce( (scopes, n) => setUnion(scopes, this.getRelationClassScopes(n)), new Set() );
            return setUnion(relScopes, parentScopes);
        } else {
            return relScopes;
        }
    }

    getRelationClassByName(name) {
        return this.graphService.schema.$("node[class_kind='relation'][name='"+name+"']");
    }
}
